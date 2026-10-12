import {
  BASE,
  REASONING,
  type OfferingRule,
  type ProviderEndpointRule,
  type ProviderRule,
} from './registry.ts';

/** 阿里云百炼。国际站与中国站规则一致。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'alibaba',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', required: 'supported', none: 'supported', specific: 'supported' },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported', codeExecution: 'supported' },
      // 主流的 qwen3 系列用 enable_thinking 开关叠加 thinking_budget 预算；其余形态见 OFFERING_RULES
      reasoning: REASONING.toggleBudgetYes,
    },
    confidence: 'verified',
    source: '阿里云百炼文档：tool_choice 支持 auto/none/required/指定函数；parameters.parallel_tool_calls 存在；Responses API 内置联网搜索、网页抓取、代码解释器；x-dashscope-session-cache 上下文缓存',
  },
  {
    providerId: 'alibaba-cn',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', required: 'supported', none: 'supported', specific: 'supported' },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported', codeExecution: 'supported' },
      reasoning: REASONING.toggleBudgetYes,
    },
    confidence: 'verified',
    source: '同阿里云百炼（中国站）文档',
  },
];

/**
 * 阿里云百炼的推理形态例外。百炼上聚合了各家模型，形态随模型本身而定：
 * GLM / DeepSeek / Kimi 沿用原厂形态，qwen 内部又按代际与用途分化。
 */
export const OFFERING_RULES: OfferingRule[] = [
  {
    providerId: 'alibaba',
    match: /^glm-5\.3/,
    patch: { reasoning: REASONING.effortNo },
    confidence: 'verified',
    source: '百炼托管的 glm-5.3：reasoning_effort 档位，只能开启、不能关闭',
  },
  {
    providerId: 'alibaba',
    match: /^glm-5\.2$/,
    patch: { reasoning: REASONING.effortYes },
    confidence: 'verified',
    source: '百炼托管的 glm-5.2：reasoning_effort 档位，传 none / minimal 即关闭',
  },
  {
    providerId: 'alibaba',
    match: /^glm-5(\.1)?$/,
    patch: { reasoning: REASONING.toggleYes },
    confidence: 'verified',
    source: '百炼托管的 glm-5 / glm-5.1：thinking.type 开关式，可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^glm-4\.7/,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: '百炼托管的 glm-4.7 系列：强制思考，不可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^deepseek-v4/,
    patch: { reasoning: REASONING.effortUnknown },
    confidence: 'verified',
    source: '百炼托管的 deepseek-v4 系列：reasoning_effort 档位，官方未公布关闭方式',
  },
  {
    providerId: 'alibaba',
    match: /^deepseek-v3|^siliconflow\/deepseek-v3/,
    patch: { reasoning: REASONING.toggleYes },
    confidence: 'verified',
    source: '百炼托管的 deepseek-v3 系列（含 siliconflow 前缀）：thinking 开关式，可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^deepseek-r1|^siliconflow\/deepseek-r1/,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: '百炼托管的 deepseek-r1 系列（含蒸馏版与 siliconflow 前缀）：强制思考，不可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^(kimi\/)?kimi-k2\.[56]$/,
    patch: { reasoning: REASONING.toggleYes },
    confidence: 'verified',
    source: '百炼托管的 kimi-k2.5 / k2.6：thinking.type 开关式，可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^kimi-k2-thinking$|k2\.7-code/,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: '百炼托管的 kimi-k2-thinking 与 kimi-k2.7-code：强制思考，不可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^kimi-k3$/,
    patch: { reasoning: REASONING.effortUnknown },
    confidence: 'verified',
    source: '百炼托管的 kimi-k3：reasoning_effort 档位，官方未公布关闭方式',
  },
  {
    providerId: 'alibaba',
    match: /MiniMax-M2\./,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: '百炼托管的 MiniMax-M2 系列：强制思考，不可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^qwen3\.8-/,
    patch: { reasoning: REASONING.effortUnknown },
    confidence: 'verified',
    source: '百炼 qwen3.8 系列：reasoning_effort 档位，官方未公布关闭方式',
  },
  {
    providerId: 'alibaba',
    match: /^qwen3-max$/,
    patch: { reasoning: REASONING.toggleYes },
    confidence: 'verified',
    source: '百炼 qwen3-max：thinking 开关式（兼容 API 用 enable_thinking），可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^qwen3-next-80b-a3b-thinking$/,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: '百炼 qwen3-next-80b-a3b-thinking：强制思考，无用户可选档位（thinking_budget 仅可调上限），不可关闭',
  },
  {
    providerId: 'alibaba',
    match: /^qvq-max$|^qwq-plus$/,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: '百炼 qvq-max / qwq-plus：仅思考，官方未提供公开关闭参数',
  },
  {
    providerId: 'alibaba',
    match: /^qwq-32b$/,
    patch: { reasoning: REASONING.forcedUnknown },
    confidence: 'verified',
    source: '百炼 qwq-32b：无思考档位，官方未公布关闭方式',
  },
];

/**
 * 阿里云百炼各渠道的协议根地址。Anthropic 兼容统一挂在域名根下的 /apps/anthropic，
 * Responses 与 Chat Completions 同用 /compatible-mode/v1（Token / Coding Plan 目前只列 OpenAI 与 Anthropic 两种协议）。
 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'alibaba',
    protocolBaseURLs: {
      anthropic: 'https://dashscope-intl.aliyuncs.com/apps/anthropic/v1',
      responses: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览（help.aliyun.com/zh/model-studio/base-url）：新加坡地域 OpenAI 兼容根为 /compatible-mode/v1、Anthropic 兼容根为 /apps/anthropic；Responses 与 Chat 同用 /compatible-mode/v1（.../compatibility-with-openai-responses-api）；Anthropic Messages 完整端点为 https://dashscope-intl.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-cn',
    protocolBaseURLs: {
      anthropic: 'https://dashscope.aliyuncs.com/apps/anthropic/v1',
      responses: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览（help.aliyun.com/zh/model-studio/base-url）：华北2（北京）Anthropic 兼容根为 /apps/anthropic；Responses 与 Chat 同用 /compatible-mode/v1；Anthropic Messages 完整端点为 https://dashscope.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-token-plan',
    protocolBaseURLs: {
      anthropic: 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼国际站文档（www.alibabacloud.com/help/en/model-studio/token-plan-overview）：Token Plan 的 Anthropic 兼容根为 /apps/anthropic；该渠道只列 OpenAI 与 Anthropic 两种协议，未提供 Responses 根；Anthropic Messages 完整端点为 https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-token-plan-cn',
    protocolBaseURLs: {
      anthropic: 'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览「Token Plan」一节（help.aliyun.com/zh/model-studio/base-url）：华北2（北京）Anthropic 兼容根为 /apps/anthropic；未提供 Responses 根；Anthropic Messages 完整端点为 https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-coding-plan',
    protocolBaseURLs: {
      anthropic: 'https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼国际站文档（www.alibabacloud.com/help/en/model-studio/coding-plan）：Coding Plan 国际站的 Anthropic 兼容根为 /apps/anthropic；未提供 Responses 根；Anthropic Messages 完整端点为 https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-coding-plan-cn',
    protocolBaseURLs: {
      anthropic: 'https://coding.dashscope.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览「Coding Plan」一节（help.aliyun.com/zh/model-studio/base-url）：华北2（北京）Anthropic 兼容根为 /apps/anthropic；未提供 Responses 根；Anthropic Messages 完整端点为 https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
];
