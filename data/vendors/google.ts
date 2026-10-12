import {
  BASE,
  REASONING,
  type OfferingRule,
  type ProviderEndpointRule,
  type ProviderRule,
} from './registry.ts';

/** Google Gemini。函数调用模式、并行调用、流式工具调用、多工具并列都有官方章节。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'google',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', required: 'supported', none: 'supported', specific: 'supported' },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported', codeExecution: 'supported' },
      // 3 代起用 thinking_level 档位，官方未公布关闭方式；2.5 代与 gemma / deep-research 见 OFFERING_RULES
      reasoning: REASONING.effortUnknown,
    },
    confidence: 'verified',
    source: 'Gemini API function calling 官方文档（ai.google.dev）：目录含 Parallel function calling、Function calling modes、Stream tool calls、Multi-tool use、Function calling with Structured output 等章节；谷歌搜索接地与代码执行属于其内置工具',
  },
];

/**
 * Gemini 推理形态的例外，按模型代际区分：2.5 代是 thinkingBudget 预算式（flash 可关、pro 不可关），
 * gemma 是模板开关式可关，deep-research 是专用 Agent、不提供常规档位。
 */
export const OFFERING_RULES: OfferingRule[] = [
  {
    providerId: 'google',
    match: /^gemini-2\.5-flash/,
    patch: { reasoning: REASONING.budgetYes },
    confidence: 'verified',
    source: 'Gemini 官方文档：2.5 flash / flash-lite 用 thinkingBudget（0..24576，-1 为动态）控制思考预算，设 0 即关闭',
  },
  {
    providerId: 'google',
    match: /^gemini-2\.5-pro$/,
    patch: { reasoning: REASONING.budgetNo },
    confidence: 'verified',
    source: 'Gemini 官方文档：2.5 pro 用 thinkingBudget（128..32768，-1 为动态）控制思考预算，不可关闭',
  },
  {
    providerId: 'google',
    match: /^gemma-/,
    patch: { reasoning: REASONING.toggleYes },
    confidence: 'verified',
    source: 'Gemma 官方模板：以 enable_thinking 开关控制思考，可关闭',
  },
  {
    providerId: 'google',
    match: /^deep-research-/,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: 'Gemini 官方文档：deep-research 是专用 Agent，不提供常规思考档位，也无可关闭项',
  },
];

/**
 * Gemini 只有 OpenAI 兼容层落在本包的三种协议内；
 * 其原生 generateContent 不属于这三种，官方也未提供 Responses / Anthropic 兼容端点。
 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'google',
    protocolBaseURLs: {
      'chat-completions': 'https://generativelanguage.googleapis.com/v1beta/openai',
    },
    confidence: 'verified',
    source: 'Google 官方 OpenAI 兼容文档（ai.google.dev/gemini-api/docs/openai）：base_url 为 https://generativelanguage.googleapis.com/v1beta/openai/；官方未提供 Responses 或 Anthropic Messages 兼容端点',
  },
];
