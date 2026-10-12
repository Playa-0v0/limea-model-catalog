import {
  BASE,
  REASONING,
  type OfferingRule,
  type ProviderEndpointRule,
  type ProviderRule,
} from './registry.ts';

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
      // 新模型用 output_config.effort 档位，官方未公布关闭方式
      reasoning: REASONING.effortUnknown,
    },
    confidence: 'verified',
    source: 'Anthropic 官方 tool use 文档（docs.anthropic.com）：tool_choice 取值出现 auto / none / any / tool 四种；服务端工具为 web_search / code_execution / web_fetch / tool_search；另支持 strict: true 的严格 schema',
  },
];

/**
 * 旧的 4.5 代（haiku-4-5 / sonnet-4-5）走的是 thinking.type=enabled + budget_tokens 的预算式，
 * 且可以省略 thinking 或设 thinking.type=disabled 关闭，与新版档位式不同。
 */
export const OFFERING_RULES: OfferingRule[] = [
  {
    providerId: 'anthropic',
    match: /^claude-(haiku|sonnet)-4-5(-|$)/,
    patch: { reasoning: REASONING.budgetYes },
    confidence: 'verified',
    source: 'Anthropic 扩展思考官方文档：4.5 代 haiku / sonnet 以 thinking.type=enabled 加 budget_tokens（≥1024）控制思考预算，省略 thinking 或设 thinking.type=disabled 即可关闭；该形态与 5 代起的 output_config.effort 档位不同',
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
