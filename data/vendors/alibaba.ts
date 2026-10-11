import { BASE, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

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

/**
 * 阿里云百炼各渠道的协议根地址。Anthropic 兼容统一挂在域名根下的 /apps/anthropic，
 * Responses 与 Chat Completions 同用 /compatible-mode/v1（Token / Coding Plan 目前只列 OpenAI 与 Anthropic 两种协议）。
 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'alibaba',
    protocolBaseURLs: {
      anthropic: 'https://dashscope-intl.aliyuncs.com/apps/anthropic/v1',
      responses: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览（help.aliyun.com/zh/model-studio/base-url）：新加坡地域 OpenAI 兼容根为 /compatible-mode/v1、Anthropic 兼容根为 /apps/anthropic；Responses 与 Chat 同用 /compatible-mode/v1（.../compatibility-with-openai-responses-api）；Anthropic Messages 完整端点为 https://dashscope-intl.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-cn',
    protocolBaseURLs: {
      anthropic: 'https://dashscope.aliyuncs.com/apps/anthropic/v1',
      responses: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览（help.aliyun.com/zh/model-studio/base-url）：华北2（北京）Anthropic 兼容根为 /apps/anthropic；Responses 与 Chat 同用 /compatible-mode/v1；Anthropic Messages 完整端点为 https://dashscope.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-token-plan',
    protocolBaseURLs: {
      anthropic: 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼国际站文档（www.alibabacloud.com/help/en/model-studio/token-plan-overview）：Token Plan 的 Anthropic 兼容根为 /apps/anthropic；该渠道只列 OpenAI 与 Anthropic 两种协议，未提供 Responses 根；Anthropic Messages 完整端点为 https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-token-plan-cn',
    protocolBaseURLs: {
      anthropic: 'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览「Token Plan」一节（help.aliyun.com/zh/model-studio/base-url）：华北2（北京）Anthropic 兼容根为 /apps/anthropic；未提供 Responses 根；Anthropic Messages 完整端点为 https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-coding-plan',
    protocolBaseURLs: {
      anthropic: 'https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼国际站文档（www.alibabacloud.com/help/en/model-studio/coding-plan）：Coding Plan 国际站的 Anthropic 兼容根为 /apps/anthropic；未提供 Responses 根；Anthropic Messages 完整端点为 https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'alibaba-coding-plan-cn',
    protocolBaseURLs: {
      anthropic: 'https://coding.dashscope.aliyuncs.com/apps/anthropic/v1',
    },
    confidence: 'verified',
    source: '阿里云百炼 Base URL 总览「Coding Plan」一节（help.aliyun.com/zh/model-studio/base-url）：华北2（北京）Anthropic 兼容根为 /apps/anthropic；未提供 Responses 根；Anthropic Messages 完整端点为 https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
];
