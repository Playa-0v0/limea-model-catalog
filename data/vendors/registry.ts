import type { ApiProtocol, CapabilityPatch } from '../../src/schema.ts';

/**
 * 各厂商共享的注册表与类型。
 *
 * 单独拆出来是为了让每个厂商文件只依赖「共享表 + 自己的规则」，
 * 不与汇总入口相互引用。
 */

export type Confidence = 'verified' | 'inferred';

/** 推理控制形态的常见组合，避免各厂商文件反复写同一串字面量 */
type ReasoningPatch = NonNullable<CapabilityPatch['reasoning']>;

export const REASONING = {
  /** 档位可调，但官方未公布关闭方式 */
  effortUnknown: { forms: ['effort'], canDisable: 'unknown' },
  /** 档位可调，且可以关闭 */
  effortYes: { forms: ['effort'], canDisable: 'yes' },
  /** 档位可调，但只能开启、不能关 */
  effortNo: { forms: ['effort'], canDisable: 'no' },
  /** 开关式，可关 */
  toggleYes: { forms: ['toggle'], canDisable: 'yes' },
  /** 开关叠预算，可关 */
  toggleBudgetYes: { forms: ['toggle', 'budget_tokens'], canDisable: 'yes' },
  /** 只有预算可调，可关 */
  budgetYes: { forms: ['budget_tokens'], canDisable: 'yes' },
  /** 只有预算可调，不可关 */
  budgetNo: { forms: ['budget_tokens'], canDisable: 'no' },
  /** 只有预算可调，关闭方式未确认 */
  budgetUnknown: { forms: ['budget_tokens'], canDisable: 'unknown' },
  /** 强制思考：无可调档位且不可关 */
  forcedNo: { forms: [], canDisable: 'no' },
  /** 强制思考，但关闭方式未确认 */
  forcedUnknown: { forms: [], canDisable: 'unknown' },
} satisfies Record<string, ReasoningPatch>;

/** 在某渠道上生效的默认能力 */
export interface ProviderRule {
  providerId: string;
  patch: CapabilityPatch;
  confidence: Confidence;
  source: string;
}

/** 覆盖渠道默认值的单条例外，按 apiModelId 正则匹配 */
export interface OfferingRule {
  providerId: string;
  match: RegExp;
  patch: CapabilityPatch;
  confidence: Confidence;
  source: string;
}

/** 只有官方资料或实测明确覆盖的协议端点才写入目录。 */
export interface ProviderEndpointRule {
  providerId: string;
  protocolBaseURLs: Partial<Record<ApiProtocol, string>>;
  confidence: Confidence;
  source: string;
}

/**
 * 协议基线：这些厂商的对话接口都是 SSE 流式，
 * 并且只要声明了 tools，就至少支持由模型自行决定要不要调用（tool_choice 的默认行为）。
 * 其余取值一律留 unknown，等有依据再说。
 */
export const BASE: CapabilityPatch = {
  streaming: 'supported',
  tools: { choice: { auto: 'supported' } },
};

// ---------------------------------------------------------------------------
// 渠道与厂商的对应关系
// ---------------------------------------------------------------------------

/** providerId -> 用户视角的厂商标识 */
export const VENDOR_BY_PROVIDER: Record<string, string> = {
  openai: 'openai',
  anthropic: 'anthropic',
  zai: 'glm',
  zhipuai: 'glm',
  moonshotai: 'kimi',
  'moonshotai-cn': 'kimi',
  deepseek: 'deepseek',
  volcengine: 'bytedance',
  alibaba: 'alibaba',
  'alibaba-cn': 'alibaba',
  xiaomi: 'xiaomi',
  minimax: 'minimax',
  'minimax-cn': 'minimax',
  google: 'google',
  xai: 'xai',

  // 套餐渠道。与厂商主体是同一套 API 表面，只是计费方式不同，
  // 因此不单独维护规则，由构建脚本回落到该厂商主渠道的规则。
  'volcengine-coding-plan': 'bytedance',
  'alibaba-token-plan': 'alibaba',
  'alibaba-token-plan-cn': 'alibaba',
  'alibaba-coding-plan': 'alibaba',
  'alibaba-coding-plan-cn': 'alibaba',
  'xiaomi-token-plan-cn': 'xiaomi',
  'xiaomi-token-plan-sgp': 'xiaomi',
  'xiaomi-token-plan-ams': 'xiaomi',
  'minimax-coding-plan': 'minimax',
  'minimax-cn-coding-plan': 'minimax',
  'zai-coding-plan': 'glm',
  'zhipuai-coding-plan': 'glm',
  'kimi-code-plan-cn': 'kimi',
  'kimi-code-plan-global': 'kimi',
};

/** 需要抓取的 provider 白名单：11 家厂商的按量付费渠道，外加上游维护的套餐渠道。 */
export const PROVIDER_IDS = Object.keys(VENDOR_BY_PROVIDER);

/** 快照里保留的 provider 展示名，避免直接用上游名称 */
export const PROVIDER_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  zai: 'Z.ai（智谱国际站）',
  zhipuai: '智谱开放平台',
  moonshotai: 'Moonshot 国际站',
  'moonshotai-cn': 'Moonshot 中国站',
  deepseek: 'DeepSeek',
  volcengine: '火山方舟',
  alibaba: '阿里云百炼（国际站）',
  'alibaba-cn': '阿里云百炼（中国站）',
  xiaomi: '小米 MiMo',
  minimax: 'MiniMax 国际站',
  'minimax-cn': 'MiniMax 中国站',
  google: 'Google Gemini',
  xai: 'xAI',
  'volcengine-coding-plan': '火山方舟 Coding Plan',
  'alibaba-token-plan': '阿里云百炼 Token Plan（国际站）',
  'alibaba-token-plan-cn': '阿里云百炼 Token Plan（中国站）',
  'alibaba-coding-plan': '阿里云百炼 Coding Plan（国际站）',
  'alibaba-coding-plan-cn': '阿里云百炼 Coding Plan（中国站）',
  'xiaomi-token-plan-cn': '小米 MiMo Token Plan（中国集群）',
  'xiaomi-token-plan-sgp': '小米 MiMo Token Plan（新加坡集群）',
  'xiaomi-token-plan-ams': '小米 MiMo Token Plan（欧洲集群）',
  'minimax-coding-plan': 'MiniMax M Plan（国际站）',
  'minimax-cn-coding-plan': 'MiniMax M Plan（中国站）',
  'zai-coding-plan': 'Z.ai Coding Plan',
  'zhipuai-coding-plan': '智谱 Coding Plan',
  'kimi-code-plan-cn': 'Kimi Code Plan（中国站）',
  'kimi-code-plan-global': 'Kimi Code Plan（国际站）',
};

/**
 * 已知的展示名偏差：我们有意不照抄上游 name 的渠道。
 * 值记的是做这个决定时的上游 name —— 上游若再改名，构建会提示复核。
 *
 * MiniMax 这两个套餐渠道上游 id 叫 coding-plan、name 却叫 Token Plan，官网现称 M Plan，
 * 这里跟随官网；一旦上游也改成 M Plan 或其他叫法，构建会提醒我们重新确认。
 */
export const PROVIDER_NAME_BASELINE: Record<string, string> = {
  'minimax-coding-plan': 'MiniMax Token Plan (minimax.io)',
  'minimax-cn-coding-plan': 'MiniMax Token Plan (minimax.cn)',
};
