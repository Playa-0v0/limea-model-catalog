/**
 * 本文件是整个包唯一的类型来源。
 *
 * 刻意不使用任何第三方校验库：所有枚举都先写成 as const 常量数组，
 * 再从中推导联合类型。这样运行时的校验脚本可以遍历常量数组，
 * 而类型与常量永远不会漂移，包本身也不需要任何运行时依赖。
 */

// ---------------------------------------------------------------------------
// 基础枚举
// ---------------------------------------------------------------------------

/**
 * 能力三态。
 * 上游（models.dev）用 boolean 表达能力，无法区分「确定不支持」和「没人确认过」。
 * 字段缺失必须映射为 unknown，不得默认成 unsupported，这是本包相对上游的核心增益。
 */
export const SUPPORTS = ['supported', 'unsupported', 'unknown'] as const;
export type Support = (typeof SUPPORTS)[number];

export const MODALITIES = ['text', 'image', 'pdf', 'audio', 'video'] as const;
export type Modality = (typeof MODALITIES)[number];

/** 模型种类。把生图 / 生视频 / 语音类和语言模型分开，避免 UI 把它们混在一个下拉里。 */
export const MODEL_KINDS = [
  'language',
  'embedding',
  'reranking',
  'image',
  'video',
  'audio',
  'transcription',
] as const;
export type ModelKind = (typeof MODEL_KINDS)[number];

/**
 * 生命周期。上游只在「非正式可用」时才写 status（beta / alpha / deprecated），
 * 缺省即视为 active，这是上游的约定而非我们的猜测。
 */
export const LIFECYCLES = ['preview', 'active', 'deprecated', 'retired', 'unknown'] as const;
export type Lifecycle = (typeof LIFECYCLES)[number];

/** 解析结论里出现的层，顺序即优先级从低到高 */
export const RESOLUTION_LAYERS = ['model', 'offering', 'adapter', 'user'] as const;
export type ResolutionLayerName = (typeof RESOLUTION_LAYERS)[number];

/** 目录可记录的供应商 API 根地址协议。 */
export const API_PROTOCOLS = ['chat-completions', 'anthropic', 'responses'] as const;
export type ApiProtocol = (typeof API_PROTOCOLS)[number];

/**
 * 可以被单独查询、覆盖与校验的能力路径。
 * 写成扁平的字符串路径而不是嵌套对象，是为了让「要求某能力」这种查询
 * 只需要一个 CapabilityPath 参数，解析器也能直接遍历全部路径。
 */
export const CAPABILITY_PATHS = [
  'streaming',
  'tools.calling',
  'tools.parallel',
  'tools.streaming',
  'tools.choice.auto',
  'tools.choice.required',
  'tools.choice.none',
  'tools.choice.specific',
  'structuredOutput.jsonMode',
  'structuredOutput.jsonSchema',
  'reasoning.supported',
  'promptCaching',
  'hostedTools.webSearch',
  'hostedTools.codeExecution',
] as const;
export type CapabilityPath = (typeof CAPABILITY_PATHS)[number];

/** 快照的结构版本。字段有破坏性变更时才 +1 */
export const SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// 能力
// ---------------------------------------------------------------------------

export interface Capabilities {
  /** 输入模态，来自上游 modalities.input */
  input: Modality[];
  /** 输出模态 */
  output: Modality[];
  /** 流式输出（SSE）。注意这不等于「流式工具」 */
  streaming: Support;
  tools: {
    /** 模型能否请求外部函数调用 */
    calling: Support;
    /** 单轮内能否并行发出多个工具调用 */
    parallel: Support;
    /** 工具参数是否随流式增量返回，而非等整段 JSON 拼完 */
    streaming: Support;
    /** tool_choice 四种取值的支持情况 */
    choice: {
      auto: Support;
      /** tool_choice: required / any，强制本轮必须调用工具 */
      required: Support;
      none: Support;
      /** 指定某个具体工具名 */
      specific: Support;
    };
  };
  structuredOutput: {
    /** 只要求返回合法 JSON，不约束结构 */
    jsonMode: Support;
    /** 按调用方给的 JSON Schema 约束输出 */
    jsonSchema: Support;
  };
  reasoning: {
    supported: Support;
    /** 保留厂商原始档位枚举，不做跨厂商统一化 */
    efforts?: string[];
  };
  promptCaching: Support;
  /** 厂商自带的托管工具（跑在厂商侧，不是本地工具执行） */
  hostedTools: {
    /** 原生联网搜索 / grounding */
    webSearch: Support;
    /** 厂商侧代码执行沙箱 */
    codeExecution: Support;
  };
}

/**
 * 能力补丁：只写需要改的字段，未出现的字段保持原值。
 * 刻意手写而不是用 DeepPartial，是为了让「哪些字段可被人工覆盖」一眼可见。
 */
export interface CapabilityPatch {
  input?: Modality[];
  output?: Modality[];
  streaming?: Support;
  tools?: {
    calling?: Support;
    parallel?: Support;
    streaming?: Support;
    choice?: {
      auto?: Support;
      required?: Support;
      none?: Support;
      specific?: Support;
    };
  };
  structuredOutput?: {
    jsonMode?: Support;
    jsonSchema?: Support;
  };
  reasoning?: {
    supported?: Support;
    efforts?: string[];
  };
  promptCaching?: Support;
  hostedTools?: {
    webSearch?: Support;
    codeExecution?: Support;
  };
}

// ---------------------------------------------------------------------------
// 上限
// ---------------------------------------------------------------------------

export interface TokenLimits {
  /** null 表示未知，不等于无限制 */
  contextWindow: number | null;
  maxInputTokens: number | null;
  maxOutputTokens: number | null;
}

// ---------------------------------------------------------------------------
// 实体
// ---------------------------------------------------------------------------

export interface ProviderDefinition {
  id: string;
  name: string;
  /** 归属厂商，用于按「11 家」的用户视角分组 */
  vendor: string;
  /** AI SDK 包名，对应上游 provider.npm */
  sdkPackage: string;
  /** 官方 API 基地址，上游未提供时为空 */
  apiBase?: string;
  /** 按协议记录的接口根地址；仅在有明确资料时填写。 */
  protocolBaseURLs?: Partial<Record<ApiProtocol, string>>;
  doc?: string;
  /** 上游声明的环境变量名。本包只记录，不读取 */
  env: string[];
}

export interface ModelDefinition {
  /** <lab>/<slug>，取自上游 canonical_model_id */
  id: string;
  name: string;
  /** 模型开发商 */
  lab: string;
  family: string | null;
  kind: ModelKind;
  description: string | null;
  capabilities: Capabilities;
  limits: TokenLimits;
  openWeights: boolean | null;
  /** 上游 knowledge 字段，知识截止时间 */
  knowledge: string | null;
  releasedAt: string | null;
  updatedAt: string | null;
}

export interface ModelOffering {
  /** <providerId>/<apiModelId> */
  id: string;
  providerId: string;
  /** 指向 ModelDefinition.id */
  modelId: string;
  /** 原样保存服务商要求的调用字符串，不通过拆 ID 猜测 */
  apiModelId: string;
  /** 该 offering 上实际生效的能力（模型定义 + 服务商覆盖 + 人工补充） */
  capabilities: Capabilities;
  /** 该 offering 上实际生效的上限 */
  limits: TokenLimits;
  /** 生命周期。同一模型在不同渠道可能不同 */
  lifecycle: Lifecycle;
}

export interface CatalogSnapshot {
  schemaVersion: typeof SCHEMA_VERSION;
  /** 快照版本：<日期>+<上游摘要> */
  snapshotVersion: string;
  generatedAt: string;
  upstream: {
    source: string;
    /** 上游 api.json 的内容摘要，用于判断数据是否漂移 */
    digest: string;
  };
  providers: ProviderDefinition[];
  models: ModelDefinition[];
  offerings: ModelOffering[];
}

// ---------------------------------------------------------------------------
// 解析结果
// ---------------------------------------------------------------------------

export interface ResolutionLayer {
  layer: ResolutionLayerName;
  status: Support;
}

export interface CapabilityResolution {
  capability: CapabilityPath;
  status: Support;
  /** 面向用户的中文说明 */
  reason: string;
  /** 从最保守到最优先的逐层结论，用于解释这个判断是怎么来的 */
  layers: ResolutionLayer[];
}
