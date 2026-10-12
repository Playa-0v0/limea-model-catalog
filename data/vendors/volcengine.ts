import { BASE, REASONING, type OfferingRule, type ProviderEndpointRule, type ProviderRule } from './registry.ts';

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
      // 平台上托管的推理模型多为 reasoning_effort 档位式；个别模型见 OFFERING_RULES
      reasoning: REASONING.effortUnknown,
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
  // 推理形态：火山上托管的第三方模型沿用其原厂形态，按网关模型名区分
  {
    providerId: 'volcengine',
    match: /^glm-5[.-]3/,
    patch: { reasoning: REASONING.effortNo },
    confidence: 'verified',
    source: '火山方舟托管的 glm-5.3 系列沿用智谱形态：reasoning_effort 档位，只能开启、不能关闭',
  },
  {
    providerId: 'volcengine',
    match: /^glm-5[.-]2/,
    patch: { reasoning: REASONING.effortYes },
    confidence: 'verified',
    source: '火山方舟托管的 glm-5.2 沿用智谱形态：reasoning_effort 档位，传 none / minimal 即关闭思考',
  },
  {
    providerId: 'volcengine',
    match: /^minimax-m3$/,
    patch: { reasoning: REASONING.toggleYes },
    confidence: 'verified',
    source: '火山方舟托管的 minimax-m3 沿用 MiniMax 形态：thinking.type=adaptive/disabled 开关，可关闭',
  },
  {
    providerId: 'volcengine',
    match: /k2\.7-code/,
    patch: { reasoning: REASONING.forcedNo },
    confidence: 'verified',
    source: '火山方舟托管的 kimi-k2.7-code 沿用 Kimi 托管形态：强制思考，不可关闭',
  },
];

/**
 * 火山方舟各渠道的协议根地址，按「按量付费 / Coding Plan / Agent Plan」三条独立入口分别记录。
 * 三条入口路径不同：Coding Plan 与 Agent Plan 的 Anthropic 兼容根挂在 /api/coding 与 /api/plan
 * 之下的 /v1；按量付费渠道的 Anthropic 兼容根为官方《接入三方工具》给出的 /api/compatible。
 */
export const ENDPOINT_RULES: ProviderEndpointRule[] = [
  {
    providerId: 'volcengine',
    protocolBaseURLs: {
      anthropic: 'https://ark.cn-beijing.volces.com/api/compatible/v1',
      responses: 'https://ark.cn-beijing.volces.com/api/v3',
    },
    confidence: 'verified',
    source: '火山方舟官方文档：Responses API 与 Chat API 同根（docs.volcengine.com/docs/82379/1585128，示例 POST /api/v3/responses）。Anthropic 兼容根依据火山方舟《接入三方工具》文档：兼容 Anthropic 接口协议的 Base URL 为 https://ark.cn-beijing.volces.com/api/compatible（OpenAI 兼容才用 /api/v3）；Anthropic Messages 完整端点为 https://ark.cn-beijing.volces.com/api/compatible/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'volcengine-coding-plan',
    protocolBaseURLs: {
      anthropic: 'https://ark.cn-beijing.volces.com/api/coding/v1',
      responses: 'https://ark.cn-beijing.volces.com/api/coding/v3',
    },
    confidence: 'verified',
    source: '火山方舟 Coding Plan 官方文档：Anthropic 协议根为 https://ark.cn-beijing.volces.com/api/coding、OpenAI 协议根为 /api/coding/v3（docs.volcengine.com/docs/ark/coding-plan-personal-ai-claude-code）；OpenClaw 接入页说明该协议根同时支持 Responses API；Anthropic Messages 完整端点为 https://ark.cn-beijing.volces.com/api/coding/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
  {
    providerId: 'volcengine-agent-plan',
    protocolBaseURLs: {
      anthropic: 'https://ark.cn-beijing.volces.com/api/plan/v1',
    },
    confidence: 'verified',
    source: '火山方舟 Agent Plan 官方文档（docs.volcengine.com/docs/ark/agent-plan-personal-other-tools）：Anthropic 协议根为 /api/plan、OpenAI 协议根为 /api/plan/v3；该页只列这两种协议，未提供 Responses 根；Anthropic Messages 完整端点为 https://ark.cn-beijing.volces.com/api/plan/v1/messages，按 Vercel AI SDK 约定，记录的 baseURL 取该端点去掉 /messages 的前缀。',
  },
];
