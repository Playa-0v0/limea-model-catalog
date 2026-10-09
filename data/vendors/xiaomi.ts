import { BASE, type OfferingRule, type ProviderRule } from './registry.ts';

/**
 * 小米 MiMo。OpenAI 与 Anthropic 两套兼容接口都只接受 tool_choice = auto，
 * 传入其它值时后端直接移除该字段、行为退化为 auto，因此其余三种记为明确不支持。
 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'xiaomi',
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
    },
    confidence: 'verified',
    source:
      '小米 MiMo 开放平台文档（mimo.mi.com / platform.xiaomimimo.com）：OpenAI Chat Completions 与 Anthropic Messages 两套兼容接口均写明 tool_choice 仅取 auto，传入其它值时后端移除该字段、行为退化为 auto；Anthropic 侧提供 disable_parallel_tool_use（默认 false），说明并行工具默认开启。工具流式增量与提示缓存未在文档中说明。流式工具经实测（mimo-v2.6-flash）：chat/completions 与 /v1/responses 均为分片增量（19 片与 20 片），但 Anthropic 兼容端点 /anthropic/v1/messages 一次性返回整段 JSON。此处按渠道主体、也就是 AI SDK 默认走的那条 chat/completions 路径记为 supported，Anthropic 兼容端点属已知例外，用该协议接入时不应依赖增量。提示缓存仍保持 unknown。联网搜索只在部分模型上提供，见 offering 规则',
  },
];

/**
 * 联网搜索是厂商托管工具（服务端执行、响应回 url_citation、单独计 web_search_usage），
 * 只在 OpenAI Chat Completions 协议上提供，且官方仅列出 v2.5 与 v2.6 两代模型可用。
 * 更早的 v2 系列不在官方列表里，但文档也没说死，因此保持 unknown。
 */
export const OFFERING_RULES: OfferingRule[] = [
  {
    providerId: 'xiaomi',
    match: /^mimo-v2\.[56]/,
    patch: { hostedTools: { webSearch: 'supported' } },
    confidence: 'verified',
    source:
      'MiMo「联网搜索」文档：在 tools 中声明 {type:"web_search"}，服务端自动执行并在响应的 annotations 里返回 url_citation，用量计在 usage.web_search_usage；支持模型为 mimo-v2.5 / v2.5-pro / v2.6-flash / v2.6-pro / v2.6-pro-ultraspeed；需先开通联网服务插件；暂不支持 OpenAI 以外的协议',
  },
];
