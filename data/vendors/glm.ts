import { BASE, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

/**
 * 智谱（GLM）。国际站 zai 与开放平台 zhipuai 规则一致。
 *
 * 官方文档写明 tool_choice「默认且仅支持 auto」，所以其余三种是明确不支持而非未知。
 *
 * 并行工具的写法是「始终开启、无法关闭」：官方 Codex 接入页在模型元数据里声明
 * supports_parallel_tool_calls: true，文档助手与开发者反馈也一致表示该行为关不掉。
 * 但函数调用正文页没有正面写并行，因此这一条的凭据弱于本文件其它字段。
 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'zai',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: {
          auto: 'supported',
          required: 'unsupported',
          none: 'unsupported',
          specific: 'unsupported',
        },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported' },
    },
    confidence: 'verified',
    source: '智谱官方文档（docs.bigmodel.cn）：工具调用页写明 tool_choice「默认且仅支持 auto」；工具流式输出页要求 stream=true 加 tool_stream=true；对话接口的 tools 支持 Web Search 类型；能力目录含「上下文缓存」页。并行的依据是官方 Codex 接入页为 glm-5.3 / glm-5-turbo 声明 supports_parallel_tool_calls: true，配合文档助手与开发者反馈「始终开启、关不掉」——正文页未正面写并行，故凭据弱于其它字段。代码执行未提及，保持 unknown',
  },
  {
    providerId: 'zhipuai',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: {
          auto: 'supported',
          required: 'unsupported',
          none: 'unsupported',
          specific: 'unsupported',
        },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported' },
    },
    confidence: 'verified',
    source: '同 Z.ai，依据智谱开放平台中文文档（docs.bigmodel.cn）的工具调用、工具流式输出、联网搜索与 Codex 接入页面；并行的凭据强度同上',
  },
];

/**
 * 智谱（GLM）四类渠道的协议根地址。国际站与开放平台的路径结构一致：
 * Anthropic 兼容挂在 /api/anthropic，OpenAI Responses 挂在 /api/v1，
 * 两者都与渠道的 Chat Completions 根（/api/paas/v4 或 /api/coding/paas/v4）并列。
 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'zai',
    protocolBaseURLs: {
      anthropic: 'https://api.z.ai/api/anthropic/v1',
      responses: 'https://api.z.ai/api/v1',
    },
    confidence: 'verified',
    source: 'Z.ai 官方文档：Anthropic Messages 协议根 https://api.z.ai/api/anthropic（docs.z.ai）；OpenAI Response 协议根 https://api.z.ai/api/v1（docs.z.ai/guides/llm/glm-5.3 的协议表）；Anthropic Messages 完整端点为 https://api.z.ai/api/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'zhipuai',
    protocolBaseURLs: {
      anthropic: 'https://open.bigmodel.cn/api/anthropic/v1',
      responses: 'https://open.bigmodel.cn/api/v1',
    },
    confidence: 'verified',
    source: '智谱开放平台官方文档：Claude API 兼容根 https://open.bigmodel.cn/api/anthropic（docs.bigmodel.cn/cn/guide/develop/claude/introduction）；OpenAI Response 协议根 https://open.bigmodel.cn/api/v1（.../cn/guide/models/text/glm-5.3 的协议表）；Anthropic Messages 完整端点为 https://open.bigmodel.cn/api/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'zai-coding-plan',
    protocolBaseURLs: {
      anthropic: 'https://api.z.ai/api/anthropic/v1',
      responses: 'https://api.z.ai/api/v1',
    },
    confidence: 'verified',
    source: 'Z.ai Coding Plan 官方文档（docs.z.ai/devpack/quick-start）：列出 Anthropic Messages 与 OpenAI Responses 两种协议根，路径与通用站一致；Anthropic Messages 完整端点为 https://api.z.ai/api/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'zhipuai-coding-plan',
    protocolBaseURLs: {
      anthropic: 'https://open.bigmodel.cn/api/anthropic/v1',
      responses: 'https://open.bigmodel.cn/api/v1',
    },
    confidence: 'verified',
    source: '智谱 Coding Plan 官方文档（docs.bigmodel.cn/cn/coding-plan/tool/others）：列出 Anthropic Message 与 OpenAI Response 两种协议根；Anthropic Messages 完整端点为 https://open.bigmodel.cn/api/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
];
