import { RULES as alibaba } from './vendors/alibaba.ts';
import { RULES as anthropic } from './vendors/anthropic.ts';
import { ENDPOINT_RULES as deepseekEndpoints, RULES as deepseek } from './vendors/deepseek.ts';
import { RULES as glm } from './vendors/glm.ts';
import { RULES as google } from './vendors/google.ts';
import { RULES as kimi } from './vendors/kimi.ts';
import { RULES as minimax } from './vendors/minimax.ts';
import { RULES as openai } from './vendors/openai.ts';
import { OFFERING_RULES as volcengineOfferings, RULES as volcengine } from './vendors/volcengine.ts';
import { RULES as xai } from './vendors/xai.ts';
import { OFFERING_RULES as xiaomiOfferings, RULES as xiaomi } from './vendors/xiaomi.ts';
import type { OfferingRule, ProviderEndpointRule, ProviderRule } from './vendors/registry.ts';

/**
 * 人工补充层的汇总入口。
 *
 * models.dev 完全没有这几类字段：工具选择（tool_choice）、并行工具、流式工具、
 * 厂商托管工具（原生联网搜索 / 代码执行）、prompt caching。
 * 缺口由 data/vendors/ 下每个厂商自己的文件补齐 —— 改某家厂商的规则只需要碰那一个文件。
 *
 * confidence 的含义：
 *   verified —— 有官方文档可引用，来源写在 source 里
 *   inferred —— 依据 API 协议形态或公开资料推断，尚未逐条核验
 *
 * 构建脚本会把所有规则打印成审计清单，凡是 inferred 或 unknown 都值得人工再看一遍。
 * 不确定就写 unknown，这是本包的设计前提，不要为了"好看"填 supported。
 */

export {
  BASE,
  PROVIDER_IDS,
  PROVIDER_NAMES,
  VENDOR_BY_PROVIDER,
} from './vendors/registry.ts';

export type { Confidence, OfferingRule, ProviderEndpointRule, ProviderRule } from './vendors/registry.ts';

/** 所有厂商的渠道规则。顺序与 provider 白名单一致，让构建输出稳定。 */
export const PROVIDER_RULES: ProviderRule[] = [
  ...openai,
  ...anthropic,
  ...glm,
  ...kimi,
  ...deepseek,
  ...volcengine,
  ...alibaba,
  ...xiaomi,
  ...minimax,
  ...google,
  ...xai,
];

/** 按渠道独立记录有官方依据的协议根地址，不随同厂商套餐自动回落。 */
export const PROVIDER_ENDPOINT_RULES: ProviderEndpointRule[] = [...deepseekEndpoints];

/** 单条 offering 级别的例外：同一渠道内按模型区分的能力（如小米只有 v2.5+ 支持联网搜索）。 */
export const OFFERING_RULES: OfferingRule[] = [
  ...xiaomiOfferings,
  ...volcengineOfferings,
];
