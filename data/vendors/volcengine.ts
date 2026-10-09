import { BASE, type OfferingRule, type ProviderRule } from './registry.ts';

/**
 * 火山方舟。它是个聚合平台，自家豆包与托管的 DeepSeek / 智谱模型共用同一套网关 API，
 * 因此平台级能力记在渠道上，只有明确以豆包为界的结论才下沉到 offering。
 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'volcengine',
    patch: {
      ...BASE,
      tools: { parallel: 'supported' },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported' },
    },
    confidence: 'verified',
    source:
      '火山方舟「Function Calling（函数调用）」文档（docs/82379/1262342）：并行工具调用一节写明 parallel_tool_calls 默认 true，单次请求可返回多个待调用的工具，false 时对支持该开关的模型限制为最多一个——这是网关 API 的行为，故记在渠道上；文档未点名具体模型。tool_choice 在全文未出现，四种取值中除默认的 auto 外一律保持 unknown。「联网搜索工具」文档：Responses API 支持 tools=[{type:"web_search"}]；上下文缓存自 250615 起支持',
  },
];

/**
 * 流式工具调用。官方措辞以豆包系列为界（「从 Doubao 1.5 系列模型开始支持流式输出」），
 * 没说平台上托管的第三方模型是否同样增量，所以只对 doubao- 开头的模型下结论。
 */
export const OFFERING_RULES: OfferingRule[] = [
  {
    providerId: 'volcengine',
    match: /^doubao-/,
    patch: { tools: { streaming: 'supported' } },
    confidence: 'verified',
    source:
      '同篇 Function Calling 文档「流式输出」一节：原文「从 Doubao 1.5 系列模型开始支持流式输出，逐步获取函数调用信息，提升响应效率」；示例代码从 chunk.choices[0].delta.tool_calls 逐个取，并用 function.arguments += 累加，即参数分片增量返回。该结论以豆包系列为界，故只覆盖 doubao- 开头的模型，火山上托管的 DeepSeek / 智谱模型保持 unknown',
  },
];
