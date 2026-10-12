import { BASE, REASONING, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

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
      // grok-4 系列用 reasoning_effort 档位，官方未公布关闭方式
      reasoning: REASONING.effortUnknown,
    },
    confidence: 'verified',
    source: 'xAI function calling 官方文档（docs.x.ai）：tool_choice 支持 auto/required/none/指定函数；并行调用默认开启，可用 parallel_tool_calls=false 关闭；内置工具为 web_search 与 x_search；文档明确写明流式场景下函数调用整段返回，故 streaming 记为 unsupported。代码执行与提示缓存未提及，保持 unknown',
  },
];

/** xAI 的 Chat Completions 与 Responses 同根，官方未提供 Anthropic Messages 兼容端点。 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'xai',
    protocolBaseURLs: {
      'chat-completions': 'https://api.x.ai/v1',
      responses: 'https://api.x.ai/v1',
    },
    confidence: 'verified',
    source: 'xAI 官方文档（docs.x.ai/docs/overview）：OpenAI 兼容 base_url 为 https://api.x.ai/v1，示例同时给出 POST /v1/responses；官方未提供 Anthropic Messages 兼容端点',
  },
];
