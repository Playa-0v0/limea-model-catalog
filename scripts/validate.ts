import { PROVIDER_ENDPOINT_RULES, PROVIDER_IDS } from '../data/capability-overrides.ts';
import { MANUAL_PROVIDERS } from '../data/manual-channels.ts';
import { CATALOG } from '../src/generated/catalog.ts';
import {
  CAPABILITY_PATHS,
  API_PROTOCOLS,
  LIFECYCLES,
  MODEL_KINDS,
  SCHEMA_VERSION,
  SUPPORTS,
  type Support,
} from '../src/schema.ts';

/**
 * 快照校验脚本。
 *
 * 生成物是纯数据模块，编译器不会替我们检查里面的字面量，
 * 所以这里用 Schema 里的常量数组逐项核对，属于「构建期兜底」。
 * 任何一条不通过都直接退出码 1。
 */

const problems: string[] = [];

function fail(message: string): void {
  problems.push(message);
}

/** 沿 "tools.choice.auto" 这种路径取原始值，不做任何兜底，才能发现写错的值 */
function rawRead(node: unknown, path: string): unknown {
  let current: unknown = node;
  for (const part of path.split('.')) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function checkSupport(where: string, caps: unknown): void {
  for (const path of CAPABILITY_PATHS) {
    const value = rawRead(caps, path);
    if (!SUPPORTS.includes(value as Support)) {
      fail(`${where} 的能力 ${path} 不是合法三态：${JSON.stringify(value)}`);
    }
  }
}

function checkUnique(where: string, ids: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`${where} 存在重复 ID：${id}`);
    seen.add(id);
  }
}

function checkSorted(where: string, ids: string[]): void {
  const sorted = [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] !== sorted[i]) {
      fail(`${where} 未按 ID 升序排列，首个错位在 ${ids[i]}`);
      return;
    }
  }
}

// 顶层结构
if (CATALOG.schemaVersion !== SCHEMA_VERSION) {
  fail(`schemaVersion 为 ${CATALOG.schemaVersion}，应为 ${SCHEMA_VERSION}`);
}

const providerIds = CATALOG.providers.map((p) => p.id);
const modelIds = CATALOG.models.map((m) => m.id);
const offeringIds = CATALOG.offerings.map((o) => o.id);

// 唯一性
checkUnique('providers', providerIds);
checkUnique('models', modelIds);
checkUnique('offerings', offeringIds);

// 渠道顺序应与白名单一致（上游渠道在前，手工渠道在后）
const expectedProviderOrder = [...PROVIDER_IDS, ...MANUAL_PROVIDERS.map((p) => p.id)].filter((id) =>
  providerIds.includes(id),
);
for (let i = 0; i < expectedProviderOrder.length; i++) {
  if (providerIds[i] !== expectedProviderOrder[i]) {
    fail(`providers 顺序与白名单不一致，第 ${i} 位是 ${providerIds[i]}，应为 ${expectedProviderOrder[i]}`);
    break;
  }
}

// 确定性排序
checkSorted('models', modelIds);
checkSorted('offerings', offeringIds);

const providerSet = new Set(providerIds);
const modelSet = new Set(modelIds);
const endpointRuleIds = new Set<string>();

for (const rule of PROVIDER_ENDPOINT_RULES) {
  if (endpointRuleIds.has(rule.providerId)) fail(`渠道 ${rule.providerId} 存在重复的协议接口规则`);
  endpointRuleIds.add(rule.providerId);
  if (!providerSet.has(rule.providerId)) fail(`协议接口规则指向未收录渠道：${rule.providerId}`);
  if (!rule.source.trim()) fail(`渠道 ${rule.providerId} 的协议接口规则缺少来源`);
  const provider = CATALOG.providers.find((candidate) => candidate.id === rule.providerId);
  for (const [protocol, baseURL] of Object.entries(rule.protocolBaseURLs)) {
    if (!provider || provider.protocolBaseURLs?.[protocol as (typeof API_PROTOCOLS)[number]] !== baseURL) {
      fail(`渠道 ${rule.providerId} 的 ${protocol} 接口规则未生成或生成值不一致`);
    }
  }
}

// 渠道自身字段
for (const provider of CATALOG.providers) {
  if (!provider.vendor) fail(`渠道 ${provider.id} 缺少 vendor`);
  if (!provider.name) fail(`渠道 ${provider.id} 缺少 name`);
  for (const [protocol, baseURL] of Object.entries(provider.protocolBaseURLs ?? {})) {
    if (!API_PROTOCOLS.includes(protocol as (typeof API_PROTOCOLS)[number])) {
      fail(`渠道 ${provider.id} 的接口协议非法：${protocol}`);
    }
    try {
      const url = new URL(baseURL);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        fail(`渠道 ${provider.id} 的 ${protocol} 接口根地址不合法`);
      }
    } catch {
      fail(`渠道 ${provider.id} 的 ${protocol} 接口根地址不是有效 URL`);
    }
  }
}

// 模型
for (const model of CATALOG.models) {
  if (!MODEL_KINDS.includes(model.kind)) {
    fail(`模型 ${model.id} 的 kind 非法：${model.kind}`);
  }
  if (!providerSet.has(model.lab) && !CATALOG.offerings.some((o) => o.modelId === model.id && providerSet.has(o.providerId))) {
    // lab 允许是上游的实验室标识，只要至少有一条合法 offering 即可
    fail(`模型 ${model.id} 没有任何合法渠道提供`);
  }
  checkSupport(`模型 ${model.id}`, model.capabilities);
  for (const [key, value] of Object.entries(model.limits)) {
    if (value !== null && (!Number.isInteger(value) || (value as number) <= 0)) {
      fail(`模型 ${model.id} 的上限 ${key} 非法：${JSON.stringify(value)}`);
    }
  }
}

// offering
const offeringCountByModel = new Map<string, number>();
for (const offering of CATALOG.offerings) {
  if (!providerSet.has(offering.providerId)) {
    fail(`offering ${offering.id} 指向未收录的渠道 ${offering.providerId}`);
  }
  if (!modelSet.has(offering.modelId)) {
    fail(`offering ${offering.id} 指向未收录的模型 ${offering.modelId}`);
  }
  if (offering.id !== `${offering.providerId}/${offering.apiModelId}`) {
    fail(`offering ${offering.id} 的 ID 与 providerId/apiModelId 不匹配`);
  }
  if (!LIFECYCLES.includes(offering.lifecycle)) {
    fail(`offering ${offering.id} 的 lifecycle 非法：${offering.lifecycle}`);
  }
  checkSupport(`offering ${offering.id}`, offering.capabilities);
  for (const [key, value] of Object.entries(offering.limits)) {
    if (value !== null && (!Number.isInteger(value) || (value as number) <= 0)) {
      fail(`offering ${offering.id} 的上限 ${key} 非法：${JSON.stringify(value)}`);
    }
  }
  offeringCountByModel.set(offering.modelId, (offeringCountByModel.get(offering.modelId) ?? 0) + 1);
}

// 每个模型至少有一条 offering
for (const model of CATALOG.models) {
  if (!offeringCountByModel.has(model.id)) {
    fail(`模型 ${model.id} 没有任何 offering`);
  }
}

// 每个渠道至少提供 1 个模型
for (const provider of CATALOG.providers) {
  if (!CATALOG.offerings.some((o) => o.providerId === provider.id)) {
    fail(`渠道 ${provider.id} 没有提供任何模型`);
  }
}

if (problems.length > 0) {
  console.error(`校验未通过，共 ${problems.length} 个问题：`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const kinds = new Set(CATALOG.models.map((m) => m.kind));
console.log(
  `校验通过：${CATALOG.providers.length} 个渠道 / ${CATALOG.models.length} 个模型 / ${CATALOG.offerings.length} 条 offering（种类 ${[...kinds].join('、')}）`,
);
