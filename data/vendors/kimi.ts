import { BASE, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

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

/** Kimi 四类渠道的协议根地址。通用站与 Code Plan 站都同时提供 OpenAI 兼容与 Anthropic 兼容两套入口。 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'moonshotai',
    protocolBaseURLs: {
      anthropic: 'https://api.moonshot.ai/anthropic/v1',
      responses: 'https://api.moonshot.ai/v1',
    },
    confidence: 'verified',
    source: 'Kimi 官方 API overview（platform.kimi.ai/docs/api/overview）：Chat Completions 与 Responses 同根 /v1，Anthropic Messages 兼容根为 /anthropic；Claude Code 接入页另给出 ANTHROPIC_BASE_URL；Anthropic Messages 完整端点为 https://api.moonshot.ai/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'moonshotai-cn',
    protocolBaseURLs: {
      anthropic: 'https://api.moonshot.cn/anthropic/v1',
      responses: 'https://api.moonshot.cn/v1',
    },
    confidence: 'verified',
    source: '同 Kimi 官方 API overview（platform.kimi.com/docs/api/overview），路径结构与国际站一致；Anthropic Messages 完整端点为 https://api.moonshot.cn/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'kimi-code-plan-cn',
    protocolBaseURLs: {
      anthropic: 'https://api.kimi.com/coding/v1',
      responses: 'https://api.kimi.com/coding/v1',
    },
    confidence: 'verified',
    source: 'Kimi Code 官方文档（www.kimi.com/code/docs/en/ 的服务端点页）：OpenAI 兼容根为 /coding/v1（含 Chat 与 Responses），Anthropic 兼容根为 /coding（完整端点 /coding/v1/messages）；Anthropic Messages 完整端点为 https://api.kimi.com/coding/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'kimi-code-plan-global',
    protocolBaseURLs: {
      anthropic: 'https://api.kimi.ai/coding/v1',
      responses: 'https://api.kimi.ai/coding/v1',
    },
    confidence: 'verified',
    source: 'Kimi Code 官方文档（www.kimi.com/code/docs/en/third-party-tools/claude-code 等）：ANTHROPIC_BASE_URL 为 https://api.kimi.ai/coding/，OpenAI 兼容根为 /coding/v1；Anthropic Messages 完整端点为 https://api.kimi.ai/coding/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
];
