import { BASE, type ProviderRule } from './registry.ts';

/**
 * xAI。官方文档明确写明：流式场景下函数调用整段返回、不做跨 chunk 增量，
 * 因此 tools.streaming 记为明确不支持，而不是未知。
 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'xai',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'unsupported',
        choice: { auto: 'supported', required: 'supported', none: 'supported', specific: 'supported' },
      },
      hostedTools: { webSearch: 'supported' },
    },
    confidence: 'verified',
    source: 'xAI function calling 官方文档（docs.x.ai）：tool_choice 支持 auto/required/none/指定函数；并行调用默认开启，可用 parallel_tool_calls=false 关闭；内置工具为 web_search 与 x_search；文档明确写明流式场景下函数调用整段返回，故 streaming 记为 unsupported。代码执行与提示缓存未提及，保持 unknown',
  },
];
