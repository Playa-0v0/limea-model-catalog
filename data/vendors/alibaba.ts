import { BASE, type ProviderRule } from './registry.ts';

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
    },
    confidence: 'verified',
    source: '同阿里云百炼（中国站）文档',
  },
];
