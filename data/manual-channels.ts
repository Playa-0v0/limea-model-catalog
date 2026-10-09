import type { CapabilityPatch, Lifecycle, ModelKind, TokenLimits } from '../src/schema.ts';
import type { Confidence } from './vendors/registry.ts';

/**
 * 手工渠道。
 *
 * data/vendors/ 里的规则是「给上游 models.dev 已有的渠道打补丁」；这里的渠道和模型
 * 上游一条都没有，所以 provider、model、offering 都要一起补。
 *
 * 由此带来一条硬约束：这里的结论只来自实测，不与按量付费渠道的规则互相回落。
 * 原因是 Agent Plan 的入口是 /api/plan，按量付费是 /api/v3，路径不同，
 * 实测结论不能互相外推。
 */

export interface ManualProvider {
  id: string;
  name: string;
  /** 用户视角的厂商，与 data/vendors/registry.ts 保持一致 */
  vendor: string;
  sdkPackage: string;
  apiBase?: string;
  doc?: string;
  env: string[];
}

/** 手工模型：上游快照里没有、只能手工定义 */
export interface ManualModel {
  id: string;
  name: string;
  lab: string;
  family: string | null;
  kind: ModelKind;
  description: string | null;
  /** 在「全 unknown」骨架上叠加的字段，写法同厂商规则 */
  patch: CapabilityPatch;
  limits: TokenLimits;
  openWeights: boolean | null;
  knowledge: string | null;
  releasedAt: string | null;
  updatedAt: string | null;
}

/** 手工 offering：网关模型名 → 目录模型 + 实测得到的能力 */
export interface ManualOffering {
  providerId: string;
  /** 网关要求的模型名 */
  apiModelId: string;
  /** 指向目录里的模型 */
  modelId: string;
  /** 只写实测覆盖到的字段，其余一律保持 unknown */
  patch: CapabilityPatch;
  lifecycle?: Lifecycle;
  confidence: Confidence;
  source: string;
}

/**
 * Agent Plan 上所有模型共同的实测结论。
 * 实测方式：两套兼容协议各发一轮带工具的请求，数流式分片、看 tool_choice 各取值的行为。
 */
const PLAN_BASE: CapabilityPatch = {
  streaming: 'supported',
  tools: {
    calling: 'supported',
    parallel: 'supported',
    streaming: 'supported',
    choice: { auto: 'supported', required: 'supported', none: 'supported', specific: 'supported' },
  },
};

const PLAN_BASE_NOTE =
  '火山方舟 Agent Plan 实测（两套协议：OpenAI 兼容 /api/plan/v3 与 Anthropic 兼容 /api/plan）：SSE 流式、工具调用与 tool_choice=auto 全部正常；其余字段（结构化输出、推理、提示缓存、托管工具）既无文档也未实测，保持 unknown。';

/** 在实测基线之上只写要改的字段 */
function planPatch(overrides?: CapabilityPatch): CapabilityPatch {
  return {
    ...PLAN_BASE,
    ...overrides,
    tools: {
      ...PLAN_BASE.tools,
      ...overrides?.tools,
      choice: { ...PLAN_BASE.tools?.choice, ...overrides?.tools?.choice },
    },
  };
}

export const MANUAL_PROVIDERS: ManualProvider[] = [
  {
    id: 'volcengine-agent-plan',
    name: '火山方舟 Agent Plan',
    vendor: 'bytedance',
    sdkPackage: '@ai-sdk/openai-compatible',
    apiBase: 'https://ark.cn-beijing.volces.com/api/plan/v3',
    doc: 'https://www.volcengine.com/docs/82379/1330310',
    env: ['ARK_API_KEY'],
  },
];

export const MANUAL_MODELS: ManualModel[] = [
  {
    id: 'bytedance-seed/seed-2.1-lite',
    name: 'Seed 2.1 Lite',
    lab: 'bytedance-seed',
    family: 'seed',
    kind: 'language',
    description: null,
    // 上游没有这个模型。它能稳定承接会话、且同代的 Seed 2.1 都是文本/图片/视频进、文本出，
    // 这里沿用同一套模态与工具结论；上下文与输出上限因尺寸不同会变化，无依据，留空。
    patch: planPatch({ input: ['text', 'image', 'video'], output: ['text'] }),
    limits: { contextWindow: null, maxInputTokens: null, maxOutputTokens: null },
    openWeights: false,
    knowledge: null,
    releasedAt: null,
    updatedAt: null,
  },
];

export const MANUAL_OFFERINGS: ManualOffering[] = [
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'doubao-seed-evolving',
    modelId: 'bytedance-seed/seed-evolving',
    patch: planPatch({ tools: { choice: { none: 'unsupported' } } }),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：tool_choice=none 实测仍调用工具，两套协议一致，记为 unsupported。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'doubao-seed-2.1-pro',
    modelId: 'bytedance-seed/seed-2.1-pro',
    patch: planPatch({ tools: { choice: { none: 'unsupported' } } }),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：tool_choice=none 实测仍调用工具，两套协议一致，记为 unsupported。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'doubao-seed-2.1-lite',
    modelId: 'bytedance-seed/seed-2.1-lite',
    patch: planPatch(),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 四种 tool_choice、并行工具与流式工具均实测通过。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'doubao-seed-2.0-mini',
    modelId: 'bytedance-seed/seed-2.0-mini',
    patch: planPatch(),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 四种 tool_choice、并行工具与流式工具均实测通过。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'deepseek-v4.1-flash',
    modelId: 'deepseek/deepseek-v4.1-flash',
    patch: planPatch(),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 四种 tool_choice、并行工具与流式工具均实测通过。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'deepseek-v4-pro',
    modelId: 'deepseek/deepseek-v4-pro',
    patch: planPatch(),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 四种 tool_choice、并行工具与流式工具均实测通过。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'deepseek-v4-flash',
    modelId: 'deepseek/deepseek-v4-flash',
    patch: planPatch(),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 四种 tool_choice、并行工具与流式工具均实测通过。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'glm-5.3',
    modelId: 'zhipuai/glm-5.3',
    patch: planPatch({ tools: { choice: { specific: 'unknown' } } }),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：tool_choice 指定具体工具时，Anthropic 侧通过、OpenAI 侧返回 200 但未调用，两套协议结论不一致，specific 保持 unknown。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'glm-5.3-flash',
    modelId: 'zhipuai/glm-5.3-flash',
    patch: planPatch({ tools: { choice: { none: 'unsupported' } } }),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：tool_choice=none 实测仍调用工具，两套协议一致，记为 unsupported。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'kimi-k3',
    modelId: 'moonshotai/kimi-k3',
    patch: planPatch({ tools: { choice: { specific: 'unsupported' } } }),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：tool_choice 指定具体工具实测返回 HTTP 400，两套协议一致，记为 unsupported。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'kimi-k2.7-code',
    modelId: 'moonshotai/kimi-k2.7-code',
    patch: planPatch({ tools: { choice: { required: 'unsupported', specific: 'unsupported' } } }),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：tool_choice=required 在 OpenAI 协议返回 HTTP 400，指定具体工具两套协议均返回 HTTP 400，两项记为 unsupported（Anthropic 协议的 any 虽通过，但以更严格的 OpenAI 侧为准）。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'kimi-k2.8-preview',
    modelId: 'moonshotai/kimi-k2.8-preview',
    patch: planPatch({ tools: { choice: { specific: 'unsupported' } } }),
    lifecycle: 'preview',
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：tool_choice 指定具体工具实测返回 HTTP 400，两套协议一致，记为 unsupported。`,
  },
  {
    providerId: 'volcengine-agent-plan',
    apiModelId: 'minimax-m3',
    modelId: 'minimax/MiniMax-M3',
    patch: planPatch({ tools: { parallel: 'unsupported', streaming: 'unsupported' } }),
    confidence: 'verified',
    source: `${PLAN_BASE_NOTE} 例外：并行工具一轮只发起 1 个调用、流式工具整段返回（分片数 1），两套协议一致，两项记为 unsupported。`,
  },
];
