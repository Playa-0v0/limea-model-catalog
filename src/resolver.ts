import {
  CAPABILITY_PATHS,
  type CapabilityPath,
  type CapabilityResolution,
  type ModelDefinition,
  type ModelOffering,
  type ProviderDefinition,
  type Support,
} from './schema.ts';
import { getModel, getOffering, getProvider, readCapability } from './queries.ts';

/**
 * 解析层。核心是两件事：
 *   1. 把三态能力按「模型 → 渠道 → Adapter → 用户」四层合并，并说明每一层的判断；
 *   2. 真源归属：Adapter 说没实现，一律一票否决；Catalog 说支持但 Adapter 没实现，降级为 unknown。
 */

export type CapabilityTarget = { modelId: string } | { offeringId: string };

/** 直接取某一层上的原始结论，不做任何跨层仲裁 */
export function supports(target: CapabilityTarget, capability: CapabilityPath): Support {
  if ('offeringId' in target) {
    return readCapability(requireOfferingCaps(target.offeringId), capability);
  }
  return readCapability(requireModelCaps(target.modelId), capability);
}

function requireOfferingCaps(offeringId: string) {
  const offering = getOffering(offeringId);
  if (!offering) throw new Error(`未收录的 offering：${offeringId}`);
  return offering.capabilities;
}

function requireModelCaps(modelId: string) {
  const model = getModel(modelId);
  if (!model) throw new Error(`未收录的模型：${modelId}`);
  return model.capabilities;
}

/** AI SDK Adapter 实际实现的能力。未列出的路径表示「Adapter 没有声明」 */
export type AdapterCapabilities = Partial<Record<CapabilityPath, Support>>;

export interface ResolveInput {
  offeringId: string;
  /** 不传表示不让 Adapter 参与仲裁，此时结论只来自 Catalog */
  adapter?: AdapterCapabilities;
  /** 用户在设置里关掉的能力，只能收紧，不能绕过硬限制 */
  userDisabled?: readonly CapabilityPath[];
}

export interface ResolvedModel {
  offering: ModelOffering;
  model: ModelDefinition | undefined;
  provider: ProviderDefinition | undefined;
  /** 全部能力路径的最终结论，UI 直接查表 */
  capabilities: Record<CapabilityPath, CapabilityResolution>;
}

interface MergedConclusion {
  status: Support;
  reason: string;
}

function mergeCapability(
  path: CapabilityPath,
  modelStatus: Support,
  offeringStatus: Support,
  adapterStatus: Support | undefined,
  userDisabled: boolean,
): MergedConclusion {
  // 用户层只能收紧
  if (userDisabled) {
    return { status: 'unsupported', reason: '用户已在设置中关闭该能力' };
  }

  if (adapterStatus === 'unsupported') {
    return { status: 'unsupported', reason: '当前 AI SDK Adapter 未实现该能力' };
  }

  if (adapterStatus === 'supported') {
    if (offeringStatus === 'unsupported') {
      return {
        status: 'unsupported',
        reason: 'Adapter 声称支持，但该渠道明确不支持，取更保守的结论',
      };
    }
    return { status: 'supported', reason: 'AI SDK Adapter 已实现该能力' };
  }

  if (adapterStatus === 'unknown' && offeringStatus === 'supported') {
    // Adapter 明确表示没实现时不能当可用
    return {
      status: 'unknown',
      reason: '该渠道标注支持，但当前 Adapter 未声明已实现，按未知处理',
    };
  }

  if (offeringStatus === 'supported') {
    return {
      status: 'supported',
      reason:
        modelStatus === 'supported'
          ? '模型与该渠道均明确支持'
          : '该渠道明确支持（模型级无记录）',
    };
  }
  if (offeringStatus === 'unsupported') {
    return { status: 'unsupported', reason: `该渠道明确不支持（${path}）` };
  }
  return { status: 'unknown', reason: '缺少可核验依据，暂按未知处理' };
}

export function resolveModel(input: ResolveInput): ResolvedModel {
  const offering = getOffering(input.offeringId);
  if (!offering) throw new Error(`未收录的 offering：${input.offeringId}`);

  const model = getModel(offering.modelId);
  const provider = getProvider(offering.providerId);
  const disabled = new Set(input.userDisabled ?? []);
  const adapter = input.adapter;

  const capabilities = {} as Record<CapabilityPath, CapabilityResolution>;
  for (const path of CAPABILITY_PATHS) {
    const modelStatus = model ? readCapability(model.capabilities, path) : 'unknown';
    const offeringStatus = readCapability(offering.capabilities, path);
    const adapterStatus = adapter ? (adapter[path] ?? 'unknown') : undefined;

    const merged = mergeCapability(path, modelStatus, offeringStatus, adapterStatus, disabled.has(path));

    const layers: CapabilityResolution['layers'] = [
      { layer: 'model', status: modelStatus },
      { layer: 'offering', status: offeringStatus },
    ];
    if (adapterStatus !== undefined) layers.push({ layer: 'adapter', status: adapterStatus });
    if (disabled.has(path)) layers.push({ layer: 'user', status: 'unsupported' });

    capabilities[path] = { capability: path, status: merged.status, reason: merged.reason, layers };
  }

  return { offering, model, provider, capabilities };
}
