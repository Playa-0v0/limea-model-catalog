import { BASE, type ProviderRule } from './registry.ts';

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
