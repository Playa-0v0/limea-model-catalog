import { CATALOG } from './generated/catalog.ts';
import type {
  Capabilities,
  CapabilityPath,
  Lifecycle,
  Modality,
  ModelDefinition,
  ModelKind,
  ModelOffering,
  ProviderDefinition,
  Support,
} from './schema.ts';

/**
 * 只读查询层。所有函数都是纯函数，不发网络请求、不写磁盘，浏览器可安全调用。
 */

const providerIndex = new Map<string, ProviderDefinition>();
for (const p of CATALOG.providers) providerIndex.set(p.id, p);

const modelIndex = new Map<string, ModelDefinition>();
for (const m of CATALOG.models) modelIndex.set(m.id, m);

const offeringIndex = new Map<string, ModelOffering>();
for (const o of CATALOG.offerings) offeringIndex.set(o.id, o);

/** 每个模型在某渠道上的 officering，用于「限定渠道找模型」 */
const offeringsByModel = new Map<string, ModelOffering[]>();
const offeringsByProvider = new Map<string, ModelOffering[]>();
for (const o of CATALOG.offerings) {
  (offeringsByModel.get(o.modelId) ?? offeringsByModel.set(o.modelId, []).get(o.modelId)!).push(o);
  (offeringsByProvider.get(o.providerId) ?? offeringsByProvider.set(o.providerId, []).get(o.providerId)!).push(o);
}

// ---------------------------------------------------------------------------
// 读取能力
// ---------------------------------------------------------------------------

/** 按 "tools.choice.required" 这种路径读取三态值 */
export function readCapability(capabilities: Capabilities, path: CapabilityPath): Support {
  let node: unknown = capabilities;
  for (const part of path.split('.')) {
    if (!node || typeof node !== 'object') return 'unknown';
    node = (node as Record<string, unknown>)[part];
  }
  return node === 'supported' || node === 'unsupported' || node === 'unknown' ? node : 'unknown';
}

// ---------------------------------------------------------------------------
// 基础读取
// ---------------------------------------------------------------------------

export function listProviders(): readonly ProviderDefinition[] {
  return CATALOG.providers;
}

export function listModels(): readonly ModelDefinition[] {
  return CATALOG.models;
}

export function listOfferings(): readonly ModelOffering[] {
  return CATALOG.offerings;
}

export function getProvider(providerId: string): ProviderDefinition | undefined {
  return providerIndex.get(providerId);
}

export function getModel(modelId: string): ModelDefinition | undefined {
  return modelIndex.get(modelId);
}

export function getOffering(offeringId: string): ModelOffering | undefined {
  return offeringIndex.get(offeringId);
}

export function requireProvider(providerId: string): ProviderDefinition {
  const found = providerIndex.get(providerId);
  if (!found) throw new Error(`未收录的渠道：${providerId}`);
  return found;
}

export function requireModel(modelId: string): ModelDefinition {
  const found = modelIndex.get(modelId);
  if (!found) throw new Error(`未收录的模型：${modelId}`);
  return found;
}

export function requireOffering(offeringId: string): ModelOffering {
  const found = offeringIndex.get(offeringId);
  if (!found) throw new Error(`未收录的 offering：${offeringId}`);
  return found;
}

/** 某模型在某渠道上的全部调用方式 */
export function getOfferingsOfModel(modelId: string): readonly ModelOffering[] {
  return offeringsByModel.get(modelId) ?? [];
}

/** 某渠道提供的全部模型 */
export function getOfferingsOfProvider(providerId: string): readonly ModelOffering[] {
  return offeringsByProvider.get(providerId) ?? [];
}

// ---------------------------------------------------------------------------
// 筛选
// ---------------------------------------------------------------------------

export type UnknownPolicy = 'exclude' | 'include';

export interface ModelQuery {
  /** 用户视角的厂商，如 glm / kimi / bytedance */
  vendor?: string;
  kind?: ModelKind;
  inputModalities?: readonly Modality[];
  outputModalities?: readonly Modality[];
  minContextWindow?: number;
  requiredCapabilities?: readonly CapabilityPath[];
  /** exclude（默认）要求必须明确 supported；include 允许 unknown 也通过 */
  unknownPolicy?: UnknownPolicy;
}

export interface OfferingQuery {
  providerId?: string;
  vendor?: string;
  kind?: ModelKind;
  inputModalities?: readonly Modality[];
  outputModalities?: readonly Modality[];
  lifecycle?: readonly Lifecycle[];
  requiredCapabilities?: readonly CapabilityPath[];
  unknownPolicy?: UnknownPolicy;
}

function passesCapabilities(
  capabilities: Capabilities,
  required: readonly CapabilityPath[] | undefined,
  policy: UnknownPolicy,
): boolean {
  if (!required || required.length === 0) return true;
  return required.every((path) => {
    const status = readCapability(capabilities, path);
    return status === 'supported' || (policy === 'include' && status === 'unknown');
  });
}

function hasAllModalities(actual: readonly Modality[], required?: readonly Modality[]): boolean {
  if (!required || required.length === 0) return true;
  return required.every((m) => actual.includes(m));
}

export function findModels(query: ModelQuery = {}): ModelDefinition[] {
  const policy = query.unknownPolicy ?? 'exclude';
  return CATALOG.models.filter((model) => {
    if (query.vendor && providerIndex.get(model.lab)?.vendor !== query.vendor) {
      // lab 不一定等于我们的 providerId，可能是同一厂商的其它渠道
      if (!hasVendorOffering(model.id, query.vendor)) return false;
    }
    if (query.kind && model.kind !== query.kind) return false;
    if (!hasAllModalities(model.capabilities.input, query.inputModalities)) return false;
    if (!hasAllModalities(model.capabilities.output, query.outputModalities)) return false;
    if (query.minContextWindow !== undefined) {
      const context = model.limits.contextWindow;
      if (context === null || context < query.minContextWindow) return false;
    }
    return passesCapabilities(model.capabilities, query.requiredCapabilities, policy);
  });
}

function hasVendorOffering(modelId: string, vendor: string): boolean {
  return (offeringsByModel.get(modelId) ?? []).some(
    (o) => providerIndex.get(o.providerId)?.vendor === vendor,
  );
}

export function findOfferings(query: OfferingQuery = {}): ModelOffering[] {
  const policy = query.unknownPolicy ?? 'exclude';
  return CATALOG.offerings.filter((offering) => {
    if (query.providerId && offering.providerId !== query.providerId) return false;
    if (query.vendor && providerIndex.get(offering.providerId)?.vendor !== query.vendor) return false;
    if (query.lifecycle && !query.lifecycle.includes(offering.lifecycle)) return false;

    const model = modelIndex.get(offering.modelId);
    if (query.kind && model?.kind !== query.kind) return false;
    if (!hasAllModalities(offering.capabilities.input, query.inputModalities)) return false;
    if (!hasAllModalities(offering.capabilities.output, query.outputModalities)) return false;

    return passesCapabilities(offering.capabilities, query.requiredCapabilities, policy);
  });
}
