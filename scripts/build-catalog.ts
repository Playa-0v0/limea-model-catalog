import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  OFFERING_RULES,
  PROVIDER_ENDPOINT_RULES,
  PROVIDER_IDS,
  PROVIDER_NAME_BASELINE,
  PROVIDER_NAMES,
  PROVIDER_RULES,
  VENDOR_BY_PROVIDER,
  type Confidence,
} from '../data/capability-overrides.ts';
import {
  MANUAL_MODELS,
  MANUAL_OFFERINGS,
  MANUAL_PROVIDERS,
} from '../data/manual-channels.ts';
import type {
  Capabilities,
  ApiProtocol,
  CapabilityPatch,
  CatalogSnapshot,
  Lifecycle,
  Modality,
  ModelDefinition,
  ModelKind,
  ModelOffering,
  ProviderDefinition,
  Support,
  TokenLimits,
} from '../src/schema.ts';

/**
 * 构建期脚本：拉取 models.dev 的 api.json，按白名单过滤，套上人工补充层，
 * 生成 src/generated/catalog.ts。
 *
 * 运行时不做任何网络请求，生成物是纯数据模块，浏览器也能直接 import。
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = join(ROOT, 'src', 'generated', 'catalog.ts');
const UPSTREAM_URL = 'https://models.dev/api.json';
const CACHE_FILE = join(tmpdir(), 'md-api.json');
/** 缓存有效期，超过则重新拉取 */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const MODALITIES: readonly Modality[] = ['text', 'image', 'pdf', 'audio', 'video'];

/**
 * 不收录的上游模型。官方未公布推理形态、不纳入维护，直接从目录剔除。
 * 键为 offering id（`providerId/apiModelId`）。
 */
const EXCLUDED_OFFERINGS = new Set([
  'alibaba/qwen3-vl-235b-a22b',
  'alibaba/qwen3-vl-30b-a3b',
  'alibaba-cn/qwen3-vl-235b-a22b',
  'alibaba-cn/qwen3-vl-30b-a3b',
]);

// ---------------------------------------------------------------------------
// 取数
// ---------------------------------------------------------------------------

async function loadUpstream(forceRefresh: boolean): Promise<{ text: string; fromCache: boolean }> {
  const cached = existsSync(CACHE_FILE) ? statSync(CACHE_FILE) : null;
  const fresh = cached && Date.now() - cached.mtimeMs < CACHE_TTL_MS;

  if (!forceRefresh && fresh && cached) {
    console.log(`使用缓存 ${CACHE_FILE}（${(cached.size / 1024 / 1024).toFixed(2)} MB）`);
    return { text: readFileSync(CACHE_FILE, 'utf8'), fromCache: true };
  }

  console.log(`拉取 ${UPSTREAM_URL}`);
  const res = await fetch(UPSTREAM_URL);
  if (!res.ok) throw new Error(`拉取失败：HTTP ${res.status}`);
  const text = await res.text();
  writeFileSync(CACHE_FILE, text);
  console.log(`已缓存到 ${CACHE_FILE}`);
  return { text, fromCache: false };
}

// ---------------------------------------------------------------------------
// 上游字段映射
// ---------------------------------------------------------------------------

/** 上游 boolean 缺失时必须落到 unknown，不能默认成 unsupported */
function tri(value: unknown): Support {
  if (value === true) return 'supported';
  if (value === false) return 'unsupported';
  return 'unknown';
}

function toModalities(value: unknown): Modality[] {
  if (!Array.isArray(value)) return [];
  return MODALITIES.filter((m) => value.includes(m));
}

function toEfforts(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const effort = value.find(
    (item) => item && typeof item === 'object' && (item as { type?: string }).type === 'effort',
  ) as { values?: unknown } | undefined;
  const values = effort?.values;
  if (!Array.isArray(values) || values.length === 0) return undefined;
  return values.filter((v): v is string => typeof v === 'string');
}

function toPositiveIntOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

function toLifecycle(status: unknown): Lifecycle {
  switch (status) {
    case 'deprecated':
      return 'deprecated';
    case 'retired':
      return 'retired';
    // 上游把 beta / alpha 都归为「尚未正式可用」
    case 'beta':
    case 'alpha':
      return 'preview';
    default:
      // 上游只在非正式可用时才写 status，缺省即正式可用
      return 'active';
  }
}

function deriveCapabilities(model: Record<string, unknown>): Capabilities {
  const structured = tri(model.structured_output);
  return {
    input: toModalities((model.modalities as { input?: unknown } | undefined)?.input),
    output: toModalities((model.modalities as { output?: unknown } | undefined)?.output),
    // 以下七项上游完全没有，先全部置为 unknown，由人工补充层填
    streaming: 'unknown',
    tools: {
      calling: tri(model.tool_call),
      parallel: 'unknown',
      streaming: 'unknown',
      choice: { auto: 'unknown', required: 'unknown', none: 'unknown', specific: 'unknown' },
    },
    // 上游只有一个 structured_output 开关，无法区分 json mode 与 json schema 约束
    structuredOutput: { jsonMode: structured, jsonSchema: structured },
    reasoning: { supported: tri(model.reasoning), efforts: toEfforts(model.reasoning_options), forms: [], canDisable: 'unknown' },
    promptCaching: 'unknown',
    sampling: { temperature: tri(model.temperature) },
    hostedTools: { webSearch: 'unknown', codeExecution: 'unknown' },
  };
}

function deriveLimits(model: Record<string, unknown>): TokenLimits {
  const limit = (model.limit ?? {}) as Record<string, unknown>;
  return {
    contextWindow: toPositiveIntOrNull(limit.context),
    maxInputTokens: toPositiveIntOrNull(limit.input),
    maxOutputTokens: toPositiveIntOrNull(limit.output),
  };
}

/**
 * 模型种类推导。
 *
 * 上游虽然定义了 type 字段，但目标 11 家渠道里一条都没有填，
 * 因此 embedding / reranking 只能靠模型名判断，其余靠输出模态。
 * 能调工具的一律按语言模型看待（多模态对话模型也会输出音频，不该被当成语音合成）。
 */
function deriveKind(apiModelId: string, model: Record<string, unknown>, caps: Capabilities): ModelKind {
  if (model.type === 'embedding' || /embed/i.test(apiModelId)) return 'embedding';
  if (model.type === 'reranking' || /rerank/i.test(apiModelId)) return 'reranking';
  if (caps.tools.calling === 'supported') return 'language';
  if (caps.output.includes('video')) return 'video';
  if (caps.output.includes('image')) return 'image';
  if (caps.output.includes('audio')) return 'audio';
  if (caps.input.includes('audio')) return 'transcription';
  return 'language';
}

// ---------------------------------------------------------------------------
// 补丁合并
// ---------------------------------------------------------------------------

function applyPatch(caps: Capabilities, patch: CapabilityPatch): Capabilities {
  const choice = patch.tools?.choice;
  return {
    input: patch.input ?? caps.input,
    output: patch.output ?? caps.output,
    streaming: patch.streaming ?? caps.streaming,
    tools: {
      calling: patch.tools?.calling ?? caps.tools.calling,
      parallel: patch.tools?.parallel ?? caps.tools.parallel,
      streaming: patch.tools?.streaming ?? caps.tools.streaming,
      choice: {
        auto: choice?.auto ?? caps.tools.choice.auto,
        required: choice?.required ?? caps.tools.choice.required,
        none: choice?.none ?? caps.tools.choice.none,
        specific: choice?.specific ?? caps.tools.choice.specific,
      },
    },
    structuredOutput: {
      jsonMode: patch.structuredOutput?.jsonMode ?? caps.structuredOutput.jsonMode,
      jsonSchema: patch.structuredOutput?.jsonSchema ?? caps.structuredOutput.jsonSchema,
    },
    reasoning: {
      supported: patch.reasoning?.supported ?? caps.reasoning.supported,
      efforts: patch.reasoning?.efforts ?? caps.reasoning.efforts,
      // 复制一份，避免多个 offering 共用同一个规则对象里的数组
      forms: [...(patch.reasoning?.forms ?? caps.reasoning.forms)],
      canDisable: patch.reasoning?.canDisable ?? caps.reasoning.canDisable,
    },
    promptCaching: patch.promptCaching ?? caps.promptCaching,
    sampling: { temperature: patch.sampling?.temperature ?? caps.sampling.temperature },
    hostedTools: {
      webSearch: patch.hostedTools?.webSearch ?? caps.hostedTools.webSearch,
      codeExecution: patch.hostedTools?.codeExecution ?? caps.hostedTools.codeExecution,
    },
  };
}

/**
 * 没有推理能力的模型不该带控制形态与关闭结论。
 * 渠道默认规则（如「全渠道 toggle」）会误套到无推理模型上，这里统一收口。
 */
function normalizeReasoning(caps: Capabilities): void {
  if (caps.reasoning.supported !== 'supported') {
    caps.reasoning.forms = [];
    caps.reasoning.canDisable = 'unknown';
  }
}

// ---------------------------------------------------------------------------
// 手工渠道
// ---------------------------------------------------------------------------

/** 全 unknown 骨架：手工渠道不与上游渠道互相回落，未实测的字段一律从这里起步 */
function emptyCapabilities(): Capabilities {
  return {
    input: [],
    output: [],
    streaming: 'unknown',
    tools: {
      calling: 'unknown',
      parallel: 'unknown',
      streaming: 'unknown',
      choice: { auto: 'unknown', required: 'unknown', none: 'unknown', specific: 'unknown' },
    },
    structuredOutput: { jsonMode: 'unknown', jsonSchema: 'unknown' },
    reasoning: { supported: 'unknown', forms: [], canDisable: 'unknown' },
    promptCaching: 'unknown',
    sampling: { temperature: 'unknown' },
    hostedTools: { webSearch: 'unknown', codeExecution: 'unknown' },
  };
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

interface UpstreamProvider {
  id?: string;
  name?: string;
  npm?: string;
  api?: string;
  doc?: string;
  env?: unknown;
  models?: Record<string, Record<string, unknown>>;
}

async function main(): Promise<void> {
  const forceRefresh = process.argv.includes('--refresh');
  const { text, fromCache } = await loadUpstream(forceRefresh);
  const digest = createHash('sha256').update(text).digest('hex').slice(0, 8);
  const upstream = JSON.parse(text) as Record<string, UpstreamProvider>;

  const providers: ProviderDefinition[] = [];
  const offerings: ModelOffering[] = [];
  /** 展示名与上游 name 的产品线对不上的渠道，构建结束时提示复核 */
  const nameWarnings: string[] = [];
  /** canonical id -> 该模型在各渠道上的能力，用于挑一个作为模型定义 */
  const byCanonical = new Map<string, Array<{ offering: ModelOffering; providerId: string }>>();
  /** canonical id -> 模型级原始字段（取实验室自己渠道的那份） */
  const modelFacts = new Map<string, Record<string, unknown>>();

  for (const providerId of PROVIDER_IDS) {
    const upstreamProvider = upstream[providerId];
    if (!upstreamProvider) {
      console.warn(`  ! 上游没有 provider ${providerId}，跳过`);
      continue;
    }

    // 套餐渠道不单独维护规则，回落到同厂商主渠道的规则
    const providerRule =
      PROVIDER_RULES.find((r) => r.providerId === providerId) ??
      PROVIDER_RULES.find((r) => VENDOR_BY_PROVIDER[r.providerId] === VENDOR_BY_PROVIDER[providerId]);
    if (!providerRule) throw new Error(`provider ${providerId} 缺少人工补充规则`);

    const displayName = PROVIDER_NAMES[providerId] ?? upstreamProvider.name ?? providerId;
    const drift = checkNameDrift(providerId, displayName, upstreamProvider.name);
    if (drift) nameWarnings.push(drift);

    providers.push({
      id: providerId,
      name: displayName,
      vendor: VENDOR_BY_PROVIDER[providerId]!,
      sdkPackage: upstreamProvider.npm ?? '',
      apiBase: upstreamProvider.api,
      protocolBaseURLs: protocolBaseURLsFor(providerId, upstreamProvider.npm ?? '', upstreamProvider.api),
      doc: upstreamProvider.doc,
      env: Array.isArray(upstreamProvider.env)
        ? upstreamProvider.env.filter((v): v is string => typeof v === 'string')
        : [],
    });

    const modelEntries = Object.entries(upstreamProvider.models ?? {});
    for (const [apiModelId, raw] of modelEntries) {
      if (EXCLUDED_OFFERINGS.has(`${providerId}/${apiModelId}`)) continue;

      const canonical =
        typeof raw.canonical_model_id === 'string' && raw.canonical_model_id.length > 0
          ? raw.canonical_model_id
          : `${providerId}/${apiModelId}`;

      let caps = deriveCapabilities(raw);
      caps = applyPatch(caps, providerRule.patch);
      for (const rule of OFFERING_RULES) {
        // 例外规则按厂商匹配，套餐渠道与主渠道共享同一套例外
        if (
          VENDOR_BY_PROVIDER[rule.providerId] === VENDOR_BY_PROVIDER[providerId] &&
          rule.match.test(apiModelId)
        ) {
          caps = applyPatch(caps, rule.patch);
        }
      }

      normalizeReasoning(caps);

      const offering: ModelOffering = {
        id: `${providerId}/${apiModelId}`,
        providerId,
        modelId: canonical,
        apiModelId,
        capabilities: caps,
        limits: deriveLimits(raw),
        lifecycle: toLifecycle(raw.status),
      };

      offerings.push(offering);

      const list = byCanonical.get(canonical) ?? [];
      list.push({ offering, providerId });
      byCanonical.set(canonical, list);

      // 实验室自己渠道的条目最接近「模型本身的固有属性」
      const lab = canonical.includes('/') ? canonical.slice(0, canonical.indexOf('/')) : canonical;
      if (!modelFacts.has(canonical) || providerId === lab) {
        modelFacts.set(canonical, raw);
      }
    }
  }

  const models: ModelDefinition[] = [];
  for (const [canonicalId, entries] of byCanonical) {
    const lab = canonicalId.includes('/') ? canonicalId.slice(0, canonicalId.indexOf('/')) : canonicalId;
    // 优先用实验室自己渠道的条目作为模型定义，否则退回任意一条
    const primary = entries.find((e) => e.providerId === lab) ?? entries[0]!;
    const raw = modelFacts.get(canonicalId) ?? {};
    const caps = primary.offering.capabilities;

    models.push({
      id: canonicalId,
      name: typeof raw.name === 'string' && raw.name.length > 0 ? raw.name : primary.offering.apiModelId,
      lab,
      family: typeof raw.family === 'string' ? raw.family : null,
      kind: deriveKind(primary.offering.apiModelId, raw, caps),
      description: typeof raw.description === 'string' ? raw.description : null,
      capabilities: caps,
      limits: primary.offering.limits,
      openWeights: typeof raw.open_weights === 'boolean' ? raw.open_weights : null,
      knowledge: typeof raw.knowledge === 'string' ? raw.knowledge : null,
      releasedAt: typeof raw.release_date === 'string' ? raw.release_date : null,
      updatedAt: typeof raw.last_updated === 'string' ? raw.last_updated : null,
    });
  }

  // 手工渠道：上游没有 provider / model，需要连实体一起补
  for (const spec of MANUAL_PROVIDERS) {
    const protocolBaseURLs = protocolBaseURLsFor(spec.id, spec.sdkPackage, spec.apiBase);
    providers.push({
      id: spec.id,
      name: spec.name,
      vendor: spec.vendor,
      sdkPackage: spec.sdkPackage,
      apiBase: spec.apiBase,
      protocolBaseURLs,
      doc: spec.doc,
      env: spec.env,
    });
  }

  for (const spec of MANUAL_MODELS) {
    const caps = applyPatch(emptyCapabilities(), spec.patch);
    normalizeReasoning(caps);
    models.push({
      id: spec.id,
      name: spec.name,
      lab: spec.lab,
      family: spec.family,
      kind: spec.kind,
      description: spec.description,
      capabilities: caps,
      limits: spec.limits,
      openWeights: spec.openWeights,
      knowledge: spec.knowledge,
      releasedAt: spec.releasedAt,
      updatedAt: spec.updatedAt,
    });
  }

  for (const spec of MANUAL_OFFERINGS) {
    const model = models.find((m) => m.id === spec.modelId);
    if (!model) throw new Error(`手工 offering ${spec.apiModelId} 指向未收录的模型 ${spec.modelId}`);
    const caps = applyPatch(emptyCapabilities(), spec.patch);
    // 输入输出模态、上限、采样与推理属于模型的固有事实，从模型定义继承；其余字段只认实测
    caps.input = model.capabilities.input;
    caps.output = model.capabilities.output;
    caps.sampling.temperature = model.capabilities.sampling.temperature;
    caps.reasoning = {
      supported: model.capabilities.reasoning.supported,
      forms: [...model.capabilities.reasoning.forms],
      canDisable: model.capabilities.reasoning.canDisable,
      ...(model.capabilities.reasoning.efforts
        ? { efforts: [...model.capabilities.reasoning.efforts] }
        : {}),
    };
    offerings.push({
      id: `${spec.providerId}/${spec.apiModelId}`,
      providerId: spec.providerId,
      modelId: spec.modelId,
      apiModelId: spec.apiModelId,
      capabilities: caps,
      limits: model.limits,
      lifecycle: spec.lifecycle ?? 'active',
    });
  }

  const providerOrder = [...PROVIDER_IDS, ...MANUAL_PROVIDERS.map((p) => p.id)];
  providers.sort((a, b) => providerOrder.indexOf(a.id) - providerOrder.indexOf(b.id));
  models.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  offerings.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const snapshot: CatalogSnapshot = {
    schemaVersion: 1,
    snapshotVersion: `${new Date().toISOString().slice(0, 10)}+${digest}`,
    generatedAt: new Date().toISOString(),
    upstream: { source: UPSTREAM_URL, digest },
    providers,
    models,
    offerings,
  };

  writeGenerated(snapshot);
  report(snapshot, fromCache, digest, nameWarnings);
}

function protocolBaseURLsFor(providerId: string, sdkPackage: string, apiBase: string | undefined): Partial<Record<ApiProtocol, string>> {
  const protocolBaseURLs: Partial<Record<ApiProtocol, string>> = {};
  if (apiBase && sdkPackage === '@ai-sdk/openai-compatible') protocolBaseURLs['chat-completions'] = apiBase;
  if (apiBase && sdkPackage === '@ai-sdk/anthropic') protocolBaseURLs.anthropic = apiBase;
  const endpointRule = PROVIDER_ENDPOINT_RULES.find((rule) => rule.providerId === providerId);
  Object.assign(protocolBaseURLs, endpointRule?.protocolBaseURLs);
  return protocolBaseURLs;
}

function writeGenerated(snapshot: CatalogSnapshot): void {
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  const body = JSON.stringify(snapshot, null, 2);

  const file = `// 本文件由 scripts/build-catalog.ts 生成，请勿手工编辑。
// 数据来源：${snapshot.upstream.source}（摘要 ${snapshot.upstream.digest}）
// 上游 models.dev 依 MIT License 分发，Copyright (c) 2025 models.dev
// 生成时间：${snapshot.generatedAt}
import type { CatalogSnapshot } from '../schema.ts';

/** 递归冻结，防止调用方改到全局快照 */
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value as object)) {
      freeze((value as Record<string, unknown>)[key]);
    }
    Object.freeze(value);
  }
  return value;
}

// 先声明成 unknown 再断言，避免 tsc 去逐个字段检查这一大坨字面量；
// 数据是否合规由 scripts/validate.ts 用 Schema 实际校验。
const raw: unknown = ${body};

export const CATALOG: CatalogSnapshot = freeze(raw) as CatalogSnapshot;

export default CATALOG;
`;

  writeFileSync(OUT_FILE, file);
}

/**
 * 抽「X Plan」产品线描述。
 * 套餐渠道的产品线命名在上游会被改来改去（Token Plan / Coding Plan / M Plan），
 * 而我们的中文展示名是写死的，不会自动跟随，所以只比对这一段。
 */
function planDescriptor(name: string): string | null {
  const match = /([A-Za-z][A-Za-z.]*)\s+Plan\b/.exec(name);
  return match ? `${match[1]} Plan` : null;
}

/**
 * 展示名漂移检查：两边都写了「X Plan」但写法不同，且不是登记过的已知偏差时，提示复核。
 * 已知偏差记在 PROVIDER_NAME_BASELINE 里，上游没再改名就不提示。
 */
function checkNameDrift(providerId: string, displayName: string, upstreamName?: string): string | null {
  if (!upstreamName || upstreamName === displayName) return null;
  const ours = planDescriptor(displayName);
  const theirs = planDescriptor(upstreamName);
  if (!ours || !theirs || ours === theirs) return null;
  if (PROVIDER_NAME_BASELINE[providerId] === upstreamName) return null;
  return `${providerId}：上游 name「${upstreamName}」用「${theirs}」，我们的展示名用「${ours}」，请复核`;
}

function report(snapshot: CatalogSnapshot, fromCache: boolean, digest: string, nameWarnings: string[]): void {
  const vendors = new Set(snapshot.providers.map((p) => p.vendor));
  console.log('');
  console.log(`快照 ${snapshot.snapshotVersion}（上游摘要 ${digest}${fromCache ? '，来自缓存' : ''}）`);
  console.log(`  ${vendors.size} 家厂商 / ${snapshot.providers.length} 个渠道 / ${snapshot.models.length} 个模型 / ${snapshot.offerings.length} 条 offering`);

  const kinds = new Map<string, number>();
  for (const m of snapshot.models) kinds.set(m.kind, (kinds.get(m.kind) ?? 0) + 1);
  console.log(`  模型种类：${[...kinds].map(([k, n]) => `${k}=${n}`).join(' ')}`);

  const fields = [
    'tools.calling',
    'tools.parallel',
    'tools.streaming',
    'tools.choice.required',
    'hostedTools.webSearch',
    'hostedTools.codeExecution',
  ] as const;

  console.log('');
  console.log('  关键能力的覆盖情况（按 offering 计）：');
  for (const field of fields) {
    const tally: Record<Support, number> = { supported: 0, unsupported: 0, unknown: 0 };
    for (const o of snapshot.offerings) tally[readField(o.capabilities, field)]++;
    console.log(
      `    ${field.padEnd(26)} supported=${String(tally.supported).padStart(3)} unsupported=${String(tally.unsupported).padStart(3)} unknown=${String(tally.unknown).padStart(3)}`,
    );
  }

  const counts: Record<Confidence, number> = { verified: 0, inferred: 0 };
  for (const r of PROVIDER_RULES) counts[r.confidence]++;
  console.log('');
  console.log(`  人工补充规则：${PROVIDER_RULES.length} 条（verified ${counts.verified} / inferred ${counts.inferred}）`);
  for (const r of PROVIDER_RULES) {
    console.log(`    [${r.confidence}] ${r.providerId}：${r.source}`);
  }

  if (nameWarnings.length > 0) {
    console.log('');
    console.log('  渠道展示名与上游不一致，请复核：');
    for (const w of nameWarnings) console.log(`    ! ${w}`);
  }
}

function readField(caps: Capabilities, field: string): Support {
  const parts = field.split('.');
  let node: unknown = caps;
  for (const part of parts) {
    if (!node || typeof node !== 'object') return 'unknown';
    node = (node as Record<string, unknown>)[part];
  }
  return node === 'supported' || node === 'unsupported' || node === 'unknown' ? node : 'unknown';
}

await main();
