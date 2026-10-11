import { BASE, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

/** Anthropic。tool_choice 的 any 对应本包的 required（强制本轮必须调工具）。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'anthropic',
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
    source: 'Anthropic 官方 tool use 文档（docs.anthropic.com）：tool_choice 取值出现 auto / none / any / tool 四种；服务端工具为 web_search / code_execution / web_fetch / tool_search；另支持 strict: true 的严格 schema',
  },
];

/** Anthropic 的 Messages 协议与 OpenAI SDK 兼容层同根，官方未提供 Responses 端点。 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'anthropic',
    protocolBaseURLs: {
      anthropic: 'https://api.anthropic.com/v1',
      'chat-completions': 'https://api.anthropic.com/v1',
    },
    confidence: 'verified',
    source: 'Anthropic 官方文档：Messages API 位于 https://api.anthropic.com，请求路径 POST /v1/messages（platform.claude.com/docs/en/api/overview）；另提供 OpenAI SDK 兼容层，base_url 写作 https://api.anthropic.com/v1/（.../cli-sdks-libraries/libraries/openai-sdk）。官方未提供 Responses 端点',
  },
];
