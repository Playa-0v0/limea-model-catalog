import { BASE, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

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
    },
    confidence: 'verified',
    source: 'Gemini API function calling 官方文档（ai.google.dev）：目录含 Parallel function calling、Function calling modes、Stream tool calls、Multi-tool use、Function calling with Structured output 等章节；谷歌搜索接地与代码执行属于其内置工具',
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
