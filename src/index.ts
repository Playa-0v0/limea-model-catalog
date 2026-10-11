/**
 * 公共 API 入口。
 *
 * 这个包只回答「模型在这个渠道上有什么能力」，不做 HTTP 请求、不保存密钥、
 * 也不授予任何权限。工具执行、文件修改、系统命令的审批仍然属于 Harness。
 */

export {
  CAPABILITY_PATHS,
  API_PROTOCOLS,
  LIFECYCLES,
  MODALITIES,
  MODEL_KINDS,
  RESOLUTION_LAYERS,
  SCHEMA_VERSION,
  SUPPORTS,
} from './schema.ts';

export type {
  Capabilities,
  ApiProtocol,
  CapabilityPatch,
  CapabilityPath,
  CapabilityResolution,
  CatalogSnapshot,
  Lifecycle,
  Modality,
  ModelDefinition,
  ModelKind,
  ModelOffering,
  ProviderDefinition,
  ResolutionLayer,
  ResolutionLayerName,
  Support,
  TokenLimits,
} from './schema.ts';

export {
  findModels,
  findOfferings,
  getModel,
  getOffering,
  getOfferingsOfModel,
  getOfferingsOfProvider,
  getProvider,
  listModels,
  listOfferings,
  listProviders,
  readCapability,
  requireModel,
  requireOffering,
  requireProvider,
} from './queries.ts';

export type { ModelQuery, OfferingQuery, UnknownPolicy } from './queries.ts';

export { resolveModel, supports } from './resolver.ts';

export type { AdapterCapabilities, CapabilityTarget, ResolveInput, ResolvedModel } from './resolver.ts';

export { CATALOG } from './generated/catalog.ts';
