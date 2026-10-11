import { BASE, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

/** DeepSeek 的三个接口格式均有官方接入文档；Anthropic 格式单独使用 /anthropic 根路径。 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'deepseek',
    protocolBaseURLs: {
      'chat-completions': 'https://api.deepseek.com',
      anthropic: 'https://api.deepseek.com/anthropic/v1',
      responses: 'https://api.deepseek.com',
    },
    confidence: 'verified',
    source: 'DeepSeek 官方文档：https://api-docs.deepseek.com/guides/codex 明确 OpenAI 与 Anthropic base_url；https://api-docs.deepseek.com/guides/responses_api 明确 Responses API 根地址；Anthropic Messages 完整端点为 https://api.deepseek.com/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
];

/** DeepSeek。并行工具始终开启，官方未提到 none，因此该项留 unknown。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'deepseek',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', required: 'supported', specific: 'supported' },
      },
      promptCaching: 'supported',
    },
    confidence: 'verified',
    source: 'DeepSeek 官方文档：parallel_tool_calls「忽略（并行工具调用始终开启）」；tool_choice 支持 auto/required/指定函数；Responses API 提供 response.function_call_arguments.delta；结构化输出 text.format 完整支持',
  },
];
