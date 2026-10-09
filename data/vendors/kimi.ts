import { BASE, type ProviderRule } from './registry.ts';

/** Kimi（Moonshot）。国际站与国内站规则一致，工具能力齐全。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'moonshotai',
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
    source: 'Kimi 官方「Tool Choice」文档明确支持 required/none/auto/指定函数；官方工具列表含 web-search、code_runner；工具调用文档说明支持并行与流式工具调用',
  },
  {
    providerId: 'moonshotai-cn',
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
    source: '同 platform.moonshot.cn 的官方工具与 Tool Choice 文档',
  },
];
