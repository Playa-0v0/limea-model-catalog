import { BASE, type ProviderRule } from './registry.ts';

/**
 * MiniMax。三套接口（Responses / OpenAI 兼容 / Anthropic 兼容）的 tool_choice
 * 都只有 auto 与 none，因此 required 与指定函数记为明确不支持。
 *
 * 服务端工具目前只有 web_search，且仅在 Anthropic Messages API 与
 * OpenAI Responses API 上可用（OpenAI Chat Completions 不支持）。
 * 能力字段是渠道级的，因此记为该渠道支持。
 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'minimax',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', none: 'supported', required: 'unsupported', specific: 'unsupported' },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported' },
    },
    confidence: 'verified',
    source: 'MiniMax 官方文档（platform.minimax.io / platform.minimaxi.com）：Responses、OpenAI 兼容与 Anthropic 兼容三处 tool_choice 取值都只有 auto 与 none，因此 required / 指定函数记为 unsupported；Responses 响应结构含 parallel_tool_calls（默认 true）；usage 含 cached_tokens 且请求支持 prompt_cache_key，故提示缓存记为 supported。另有「服务端工具」页：web_search 由服务端托管执行，Anthropic Messages API 用 {type:"web_search_20250305"}、Responses API 用 {type:"web_search"} 声明，一次请求内完成。该页明确「目前服务端工具仅提供 web_search」，未提代码执行，故 codeExecution 保持 unknown。工具流式增量文档未提，但经实测确认支持：Anthropic Messages 与 Responses 两个端点下 arguments 均分片返回',
  },
  {
    providerId: 'minimax-cn',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', none: 'supported', required: 'unsupported', specific: 'unsupported' },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported' },
    },
    confidence: 'verified',
    source: '同 MiniMax 国际站；依据 platform.minimaxi.com 的 Responses / Anthropic 兼容文档与「服务端工具（Server Tools）」页（Base URL 即 api.minimax.cn）。流式工具经 api.minimax.cn 实测为分片返回',
  },
];
