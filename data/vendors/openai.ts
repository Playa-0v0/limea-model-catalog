import { BASE, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

/** OpenAI。工具调用四种 tool_choice 齐全，内置联网搜索与代码执行。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'openai',
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
    source: 'OpenAI 官方 function calling 文档（platform.openai.com）：函数定义支持 strict；内置工具含 web_search / code_interpreter / remote MCP；tool_search 仅 gpt-5.4 及以上支持。Chat Completions 请求结构里 tool_choice 取值为 none / auto / required / 指定函数（NamedToolChoice），流式下函数参数以 delta 增量返回',
  },
];

/** OpenAI 只提供 Chat Completions 与 Responses 两种协议，官方未提供 Anthropic Messages 兼容端点。 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'openai',
    protocolBaseURLs: {
      'chat-completions': 'https://api.openai.com/v1',
      responses: 'https://api.openai.com/v1',
    },
    confidence: 'verified',
    source: 'OpenAI 官方 API 参考：Chat Completions 与 Responses 都挂在 https://api.openai.com/v1（platform.openai.com/docs/api-reference/chat 与 /responses，官方 OpenAPI 也声明该值为 servers.url）；官方未提供 Anthropic Messages 兼容端点',
  },
];
