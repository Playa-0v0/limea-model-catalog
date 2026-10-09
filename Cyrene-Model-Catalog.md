# Cyrene Model Catalog 设计与实施方案

> **项目**：`@cyrene/model-catalog`
> **定位**：可离线使用、独立发布的模型元数据与能力解析层
> **阶段**：技术设计 v0.2
> **适用场景**：Cyrene 本地 Agent 工作台 / Harness / 模型选择器
> **最后更新**：2026-10-10

---

## 0. 修订说明（v0.1 → v0.2）

v0.1 的方向和边界是对的，v0.2 不推翻它，只做重心转移：

| 改动 | v0.1 | v0.2 | 原因 |
|---|---|---|---|
| 数据来源 | 自建采集流水线，官方文档为主 | **models.dev 为底座**，官方文档只补缺口 | 采集是永久性维护负担，且不是本项目的差异化价值 |
| 核心交付物 | 完整 Catalog（数据 + 查询 + 同步） | **Resolver（可解释的能力判断）** | 真正被 Harness 和 UI 消费的是判断结果，不是数据本身 |
| 证据粒度 | 字段级 `subject` | 记录级（V0.1 降级） | 字段级证据链工程量远大于收益，推迟到 V0.2 |
| 参数模型 | 只有 min/max/enum | **新增跨参数约束** | 真实 400 报错主要来自参数互斥，而非单参数不支持 |
| 本地模型 | 待决问题 | **运行时探测，不进静态目录** | Ollama/LM Studio 能力可直接查询，静态手写会立刻过期 |
| 仓库结构 | 20+ 文件 | V0.1 约 8 个文件 | 先跑通闭环，再拆文件 |

v0.1 中保留不变的部分：§1 非目标、§2.1 四层实体、§3.5 三方能力区分、§13 的多数 ADR。

---

## 1. 目标与非目标

### 1.1 产品目标

- **跨服务商识别**：同一底层模型映射到多个服务商的调用 ID。
- **能力协商**：Harness 在启动 Run 前检查所需能力，返回 `supported / unsupported / unknown` 并说明理由，而不是猜测。
- **按服务商解析**：有效能力以 `Model + Provider Offering + API/SDK Adapter + 用户策略` 为准。
- **参数合法性校验**：在请求发出前拦住非法参数与互斥组合，这是本项目最直接可感知的价值。
- **可追溯**：关键结论附带来源与核验时间。
- **离线优先**：随包携带快照，断网仍可查询。

### 1.2 明确不做

- 不重复实现 Vercel AI SDK Provider 协议，也不做 HTTP 请求。
- 不存储凭据、余额、实时配额。
- 不承诺覆盖全球所有模型。
- 不根据 `tools.calling = supported` 推导"允许执行 Shell / 修改文件"——那属于 Harness 权限政策。
- 不把社区聚合数据当官方已验证结论。
- **不做静态的本地模型目录**，本地模型走运行时探测。

---

## 2. 使用场景

Schema 由场景反推，不凭想象堆字段。以下是首批必须支持的场景，每个都对应明确的字段需求。

| # | 场景 | 需要的判断 | 对应字段 |
|---|---|---|---|
| S1 | 用户选中某模型，UI 是否显示"推理强度"下拉 | `reasoning.supported` 及可选档位 | `reasoning.supported` / `reasoning.efforts` |
| S2 | 用户开了扩展思考后又去拖 temperature 滑块 | 该参数在此模式下是否可用 | `parameters.temperature.incompatibleWith` |
| S3 | Harness 启动 Run 前决定并行还是串行调工具 | 并行工具调用是否可用 | `tools.parallel` |
| S4 | 同一模型从 anthropic 切到 openrouter | 上下文上限、价格随之变化 | Offering 级 `limitsOverride` / `pricing` |
| S5 | 用户添加本地 Ollama 模型 | 能力从哪来 | 运行时探测（不在 Catalog 静态数据内） |
| S6 | 构建 Prompt 时分配 token 预算 | 用哪个输入上限 | `limits.contextWindow` / `maxInputTokens` 的取舍规则 |

**S2 是 v0.1 答不了的场景**，也是本项目最容易产生可见价值的地方。V0.1 必须覆盖 S1–S4、S6；S5 在 V0.3 与运行时探测一起做。

---

## 3. 领域模型

### 3.1 四层实体

| 实体 | 归属 | 含义 |
|---|---|---|
| `ModelDefinition` | Catalog | 模型身份与厂商无关的固有属性：家族、模态、能力 |
| `ProviderDefinition` | Catalog | 提供 API 服务的供应商 |
| `ModelOffering` | Catalog | 某 Provider 用特定 API 提供某模型的方式：调用 ID、价格、覆盖 |
| `UserDeployment` | Cyrene 应用 | 用户账户 / 自定义端点 / 密钥引用 / 启用状态 |

模型开发商（Creator）不必等于服务供应商（Provider）。同一模型可由多个 Provider 提供，价格与调用能力可能不同。

### 3.2 与 models.dev 的对应关系

models.dev 已经落实了同一套分层，这降低了本项目的建模成本：

| 本项目 | models.dev | 说明 |
|---|---|---|
| `ModelDefinition` | `models/<lab>/<model>.toml` | Provider 无关的模型事实 |
| `ModelOffering` | `providers/<p>/models/<model>.toml` | 通过 `base_model` 引用模型定义，只写服务商差异 |
| 跨 Provider 模型同一性 | `canonical_model_id` | 直接把服务商模型 ID 归因到原始实验室，省去大量别名映射工作 |
| Provider | `providers/<p>/provider.toml` | 含 `npm`（AI SDK 包名）、`env`、`doc`、`api` |
| 继承优先级 | "Provider fields win over model metadata" | 与本项目的"限制优先"原则一致 |

**结论**：不建议自建 `aliases` 映射体系，优先消费 `canonical_model_id`；本项目在此基础上补充 models.dev 不表达的字段（见 §5.3）。

### 3.3 推荐 ID 约定

- `modelId`：`<lab>/<model-slug>`，如 `anthropic/claude-sonnet-4-5`。
- `providerId`：如 `anthropic`、`openrouter`，与 models.dev 的 provider ID 保持一致。
- `offeringId`：`<providerId>/<model-slug>`，必须唯一。
- `apiModelId`：**原样存储服务商要求的调用字符串**，不通过拆分 ID 猜测。
- 展示名称可变，内部 ID 不变；不用展示名作主键。

---

## 4. 能力与参数模型

### 4.1 能力三态

```ts
type Support = 'supported' | 'unsupported' | 'unknown';
```

- `supported`：有明确依据且适用于该 Offering / Adapter。
- `unsupported`：有明确不支持依据。
- `unknown`：数据不足或未核验。

**为什么需要三态**：models.dev 这类上游数据用 boolean 表达能力（`tool_call = true`），**无法表达"不确定"**。boolean 缺失时无法区分"确定不支持"与"没人确认过"。三态是本项目对上游数据的核心增益，也是 `unknownPolicy` 能存在的前提。

上游映射规则：`true` → `supported`；显式 `false` → `unsupported`；字段缺失 → `unknown`（**不得默认 false**）。

### 4.2 能力字段

按场景需要，P0 只保留这些：

```ts
interface Capabilities {
  input: Modality[];              // text | image | pdf | audio | video
  output: Modality[];
  streaming: Support;
  tools: {
    calling: Support;
    parallel: Support;
    requiredChoice: Support;      // tool_choice: required
  };
  structuredOutput: {
    jsonMode: Support;
    jsonSchema: Support;
  };
  reasoning: {
    supported: Support;
    efforts?: string[];           // 保留厂商原始枚举，不做统一化
  };
  promptCaching: Support;
}
```

工具流式（`tools.streaming`）、严格 Schema（`strictSchema`）、推理预算控制等推迟到 V0.2，等有场景驱动再加。

### 4.3 参数模型（v0.2 新增，重点）

**这是 v0.1 最大的缺口。** 真实报错多数不是"参数不支持"，而是"参数之间互斥"：

- OpenAI o 系列：不接受 `temperature` / `top_p`，且输出上限字段名是 `max_completion_tokens`
- Anthropic：启用扩展思考后不接受 `temperature`
- 部分厂商：`tool_choice: required` 与并行调用互斥

单参数的三态布尔表达不了这些。因此参数用结构体而非 `Support`：

```ts
interface ParameterSpec {
  support: Support;
  allowed?: { min?: number; max?: number; enum?: string[] };
  /** 使用本参数时，这些参数必须同时不生效 */
  incompatibleWith?: string[];
  /** 使用本参数时，这些能力必须为 supported */
  requires?: string[];
  note?: string;                  // 面向用户的说明，如"开启思考后不可调"
}

interface ParameterProfile {
  temperature?: ParameterSpec;
  topP?: ParameterSpec;
  topK?: ParameterSpec;
  stopSequences?: ParameterSpec;
  frequencyPenalty?: ParameterSpec;
  presencePenalty?: ParameterSpec;
  seed?: ParameterSpec;
  systemMessage?: ParameterSpec;
  maxOutputTokens?: ParameterSpec & { paramName?: string };
}
```

配套一个校验函数，这才是"避免发送非法参数"的落点：

```ts
validateParameters(offeringId, params, context)
  → { ok: boolean; violations: Array<{ param: string; reason: string }> }
```

`context` 用于表达当前生效的开关（如 `{ reasoning: { enabled: true } }`），才能判断互斥。

**边界**：只记录 AI SDK 未归一化的差异。如果 AI SDK 已经帮我们转换了字段名或剥掉了冲突参数，这里就不重复记录。归属规则见 §9.2。

### 4.4 Token 上限

```ts
interface TokenLimits {
  contextWindow: number | null;   // null = 未知，不等于无限制
  maxInputTokens: number | null;
  maxOutputTokens: number | null;
}
```

**不要用 `contextWindow - maxOutputTokens` 推导真实输入上限。** 冲突时取更保守值并标记冲突来源（对应 S6）。

### 4.5 三种"工具"必须分开

| 术语 | 所属层 | 例子 |
|---|---|---|
| `tools.calling` | Model / Offering | 模型能请求外部函数调用 |
| `hostedTools` | Provider Offering | 厂商 Web Search、Code Interpreter |
| `executionPermissions` | Cyrene Harness | 能否执行 Shell、写入用户文件 |

即使模型能调用工具，Harness 仍独立执行审批与沙箱政策。

---

## 5. 数据策略

### 5.1 分工

| 角色 | 数据源 | 职责 |
|---|---|---|
| 底座 | **models.dev**（`catalog.json`） | 模型身份、家族、模态、基础能力、上下文上限、token 价格 |
| 补充 | 官方文档 | models.dev 未覆盖、且风险高的字段（跨参数约束、托管工具） |
| 修正 | 本项目 `overrides/` | 纠错、补字段、标记冲突，必须带理由与来源 |
| 运行时 | 本地模型探测 | 本地模型能力，**不写入静态目录** |

选择理由：models.dev 已在维护同一批数据，并用 `canonical_model_id` 打通了跨 Provider 同一性。重复采集不会带来优势，只会带来负债。

### 5.2 构建期流程

```text
拉取 models.dev/catalog.json（锁定版本，缓存到本地）
        ↓
用 model-schema.json 校验上游结构，检测字段漂移
        ↓
归一化：boolean → 三态；字段重命名；补 offeringId
        ↓
与本项目 overrides/ 合并（记录级覆盖）
        ↓
交叉引用与唯一性校验（Zod）
        ↓
生成快照：catalog.ts + manifest.json（含上游修订、抓取时间、内容摘要）
```

关键原则：

- **快照在构建期生成，运行时零网络请求。**
- 上游结构变化必须让构建**失败并告警**，不能静默降级。
- 不把未经验证的上游数据直接覆盖已核验字段。

### 5.3 必须由本项目补充、models.dev 不提供的内容

1. **跨参数约束**（§4.3）——上游完全没有这个概念。
2. **三态中的 `unknown`**——上游 boolean 表达不了。
3. **多单位定价**——models.dev 的价格是"每百万 token / 每百万音频 token"，没有"每张图""每分钟音频""每次请求"单位。
4. **托管工具清单**——厂商 Web Search / Code Interpreter 等。
5. **冲突标记**——上游与其他来源不一致时，记录取了哪个值、为什么。

### 5.4 本地模型（不进静态目录）

Ollama `/api/show`、LM Studio 等能直接返回 `tools` / `vision` / `thinking` 等能力。正确形态是：

- Catalog 提供查询接口，但**数据由运行时写入应用侧缓存**；
- 缓存结果标记为 `method: 'runtime-probe'`，与静态数据区分；
- 静态目录里最多留一张"已知模型家族默认值"表，仅作探测失败时的兜底。

---

## 6. 仓库结构

V0.1 刻意合并文件，先跑通闭环再拆。

```text
model-catalog/
├── data/
│   ├── overrides/                  # 人工修正与补充（带理由、来源、失效期）
│   └── evidence/                   # 记录级来源索引，V0.2 启用
├── src/
│   ├── index.ts                    # 公共 API 入口
│   ├── data.ts                     # 数据入口（对应 exports "./data"）
│   ├── schema.ts                   # Zod Schema（V0.1 合并为单文件）
│   ├── generated/
│   │   └── catalog.ts              # 构建期生成，不手工编辑
│   ├── resolver.ts                 # 三层解析 + 三态合并 + 参数校验
│   ├── queries.ts                  # getModel / getOffering / findModels / supports
│   └── probe.ts                    # 本地模型探测适配（V0.3）
├── scripts/
│   ├── sync-models-dev.ts          # 拉取 + 校验 + 归一化
│   ├── validate.ts                 # 引用完整性、唯一 ID、快照可重复构建
│   └── generate.ts                 # 生成 catalog.ts + manifest.json
├── tests/
│   ├── resolver.test.ts
│   ├── validate.test.ts
│   └── fixtures/
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

**放置位置**：优先放在 Cyrene 仓库 `packages/model-catalog/`，通过 pnpm workspace 引用；包不得反向依赖 `src/harness` 或 Electron。出现独立维护者或独立发布周期时再迁出为独立仓库。

**发布入口**（`src/data.ts` 必须真实存在，v0.1 此处有缺漏）：

```json
{
  "name": "@cyrene/model-catalog",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./data": { "types": "./dist/data.d.ts", "import": "./dist/data.js" }
  }
}
```

首版仅支持 ESM。

---

## 7. Schema 草案

概念接口如下；实施时用 Zod 定义运行时 Schema，通过 `z.infer` 导出类型，避免双份定义漂移。

```ts
type Support = 'supported' | 'unsupported' | 'unknown';
type Modality = 'text' | 'image' | 'pdf' | 'audio' | 'video';

interface ModelDefinition {
  id: string;                     // <lab>/<model-slug>
  name: string;
  creator: string;
  family: string;
  kind: 'language' | 'embedding' | 'image' | 'speech' | 'transcription' | 'video';
  capabilities: Capabilities;
  limits: TokenLimits;
  lifecycle: 'preview' | 'active' | 'deprecated' | 'retired';
  releasedAt?: string;
  deprecatedAt?: string;
  retiredAt?: string;
  sourceRef?: string;             // models.dev 记录路径或文档 URL
  updatedAt: string;
}

interface ProviderDefinition {
  id: string;
  name: string;
  website?: string;
  /** AI SDK 包名，直接来自 models.dev 的 npm 字段 */
  sdkPackage?: string;
  apiTypes: string[];
}

interface ModelOffering {
  id: string;                     // <providerId>/<model-slug>
  providerId: string;
  modelId: string;
  apiModelId: string;             // 原样保存
  apiType: string;
  region?: string;
  capabilitiesOverride?: DeepOverride<Capabilities>;
  limitsOverride?: DeepOverride<TokenLimits>;
  parameters?: ParameterProfile;  // 服务商特有的参数约束
  pricing?: OfferingPricing;
  /** 与服务商无关的模型 ID，来自 models.dev canonical_model_id */
  canonicalModelId?: string;
  sourceRef?: string;
  updatedAt: string;
}

interface OfferingPricing {
  currency: string;
  rates: PriceRate[];
  effectiveFrom: string;
  sourceUrl: string;
}

interface PriceRate {
  unit: 'million_input_tokens' | 'million_output_tokens'
      | 'million_cache_read_tokens' | 'million_cache_write_tokens'
      | 'request' | 'image' | 'audio_minute';
  amount: string;                 // 十进制定价字符串，避免浮点误差
}
```

Schema 约束要求：

- 日期格式、非负/正整数、ID 唯一、外键存在性。
- `DeepOverride<T>` 按字段路径覆盖，避免 `Partial<Capabilities>` 整块替换子对象。
- 价格单位枚举固定；不同单位**不得相加**；缺失不得视为 0。
- 参数"仅特定区间支持"用 `allowed.min/max/enum`，不用布尔硬表达。

---

## 8. 公共 API

```ts
import {
  getModel, getProvider, getOffering,
  findModels, supports, resolveModel, validateParameters
} from '@cyrene/model-catalog';

const offering = getOffering('openrouter/claude-sonnet-4-5');

supports({ offeringId: offering.id, capability: 'tools.parallel' });
// 'supported' | 'unsupported' | 'unknown'

resolveModel({
  offeringId: offering.id,
  adapterCapabilities: { 'tools.parallel': 'unsupported' },
  userDisabledCapabilities: ['hostedTools.webSearch'],
});

validateParameters(offering.id, { temperature: 0.7 }, { reasoning: { enabled: true } });
// { ok: false, violations: [{ param: 'temperature', reason: '开启扩展思考后不可使用' }] }

findModels({
  kind: 'language',
  requiredCapabilities: ['tools.calling', 'streaming'],
  unknownPolicy: 'exclude',       // 默认保守
});
```

### 8.1 诊断返回值

`resolveModel()` 返回的不仅是最终状态，还要能解释判断来源：

```ts
interface CapabilityResolution {
  capability: string;
  status: Support;
  reason: string;
  sources: string[];
  layers: Array<{
    layer: 'model' | 'offering' | 'adapter' | 'user';
    status: Support;
  }>;
}
```

UI 才能显示"服务商接口不支持强制工具选择"，而不是笼统报"模型不支持"。

### 8.2 行为约定

- 未找到的 ID：`getModel` / `getOffering` 返回 `undefined`；另提供 `requireModel()` 抛类型化异常。文档固定其一。
- 所有 API 纯函数，无隐式网络请求、无磁盘写入。
- 返回只读类型，保护全局快照。
- `supports()` 不接受含糊的模型字符串，必须用 `modelId` 或 `offeringId`，通过对象参数区分。

---

## 9. 与 AI SDK / Cyrene 集成

### 9.1 依赖方向

```text
@cyrene/model-catalog  ←  Model Settings UI
                       ←  Provider / Routing 层
                       ←  Harness 能力校验
```

Catalog 不反向依赖任何 Cyrene Runtime 模块。

### 9.2 真源归属规则（v0.2 新增）

v0.1 把 `adapterCapabilities` 当作调用方传进来的任意输入，但没规定谁说了算。明确如下：

| 信息 | 真源 | 说明 |
|---|---|---|
| 云端模型的静态事实 | models.dev | 身世、上下文、价格 |
| **实际实现的能力** | **AI SDK Adapter** | 它是唯一知道"代码里到底实现了什么"的一方 |
| 本地模型能力 | 运行时探测 | Ollama / LM Studio 接口 |
| 预期值、覆盖、判断解释 | 本 Catalog | 聚合与仲裁 |

冲突处理：

- Adapter 报 `unsupported` → **一票否决**，不得被 Catalog 的 `supported` 提升。
- Adapter 未实现而 Catalog 报 `supported` → 降级为 `unknown`，不视为可用。
- Adapter 报 `supported` 而 Catalog 报 `unsupported` → 取 `unsupported` 并记录冲突（宁可保守）。
- 用户关闭的能力只能收紧，不能绕过硬限制。

### 9.3 用户自定义模型

```ts
interface UserDeployment {
  id: string;
  offeringId?: string;            // 未知模型时可空
  providerId: string;
  customApiModelId?: string;
  baseUrl?: string;
  credentialRef?: string;         // 只存密钥引用
  enabled: boolean;
  overrides?: Record<string, Support>;
}
```

保存在**应用数据库**，不提交到模型包。用户覆盖标记为"用户声明 / 未验证"，默认不能扩展安全权限。第三方兼容端点无法校验时展示"能力未知"，支持用户显式试验。

### 9.4 运行日志

每次 Run 记录：`providerId`、`offeringId`、实际 `apiModelId`、Catalog 包版本、快照版本、参数与能力解析结果、起止时间、用量与错误。**不记录 API Key 与不必要的敏感 Prompt。**

这样日后能查清"昨天能跑、今天报错"是否由端点或目录更新引起。

---

## 10. 版本、测试与发布

### 10.1 两种版本号

- **包版本**（SemVer）：代码、Schema、公共 API 兼容性。
- **快照版本**：形如 `2026-10-10+abc1234`，每次数据更新变动。
- 应用日志同时记录两者。

生成产物：`catalog.ts`、按 `modelId` / `providerId` / `offeringId` 的索引、`manifest.json`（生成时间、上游修订、内容摘要、Schema 版本）。

### 10.2 测试门槛

单元测试：

- Schema 接受合法数据，拒绝非法字段与负数上限。
- 重复 ID、引用不存在的 `modelId` / `providerId` 必须失败。
- `unsupported` 不被后续默认值误提升；`unknown` 不被当作支持。
- Offering 的能力不污染 `ModelDefinition` 原始定义。
- 价格缺失不视为 0；不同单位不相加。
- **参数互斥校验**：S2 场景（思考开启 + temperature）必须被拦下。
- 上游 boolean 缺失映射为 `unknown`，而非 `unsupported`。

集成测试：

- 用离线 Fixtures 验证同步与归一化的确定性（不依赖真实网络）。
- 上游 `model-schema.json` 变化时构建应告警。
- 快照可重复构建：同输入两次生成结果一致。

### 10.3 发布验收

- `pnpm lint` / `typecheck` / `test` / `build` 全通过。
- 新增模型必须有来源；关键能力的 `supported` 必须有依据。
- 根入口无 Electron / Node 原生模块依赖，浏览器可安全导入纯数据查询 API。
- 完全离线环境下可查询与筛选。
- 构建失败不得静默通过（上游字段漂移必须显式报错）。

---

## 11. 安全与许可

- 能力标记只是**技术元数据**，不能作为权限授予依据。
- 上游数据全部不可信，必须经 Schema 校验；严禁执行采集到的脚本或配置。
- 不在仓库、快照或日志中保存 API Key。
- 远端更新快照必须校验版本、Schema、内容摘要，并具备回滚机制。
- 工具执行、文件修改、系统命令的审批仍由 Harness / Executor 管理。
- 许可建议 **MIT**（若重视专利条款可选 Apache-2.0）。**需逐一核对 models.dev 的数据再分发条款**——"API 可读"不等于"数据可无约束再发布"。若条款不允许捆绑分发，则退化为构建期拉取、不随包分发数据。

---

## 12. 实施计划

| 阶段 | 目标 | 可验收产物 |
|---|---|---|
| **V0.1 静态闭环** | 三实体 + Schema + 三态 Resolver + 参数校验，数据来自 models.dev 构建期快照 | `supports()` / `resolveModel()` / `validateParameters()` 可用，离线可查 |
| **V0.2 覆盖与证据** | `overrides/`、记录级证据、跨参数约束补全、上游漂移告警 | 覆盖机制与审查报告 |
| **V0.3 Cyrene 集成** | Offering 解析、Adapter 覆盖、本地模型探测 | 模型设置 UI、Harness 执行前校验 |
| **V0.4 价格与历史** | 多单位定价、生命周期、快照历史 | 计费展示、历史 Run 可重现 |
| **V1.0 稳定发布** | 公共 API 冻结、文档、兼容政策 | 稳定 npm 发布 |

### V0.1 任务清单

- [ ] 初始化 `@cyrene/model-catalog`：ESM、TypeScript、Vitest、Zod。
- [ ] 拉取 `models.dev/catalog.json` + `model-schema.json`，写归一化脚本与 boolean → 三态映射。
- [ ] 定义 `ModelDefinition` / `ProviderDefinition` / `ModelOffering` Schema，含 `ParameterProfile`。
- [ ] 实现三层 Resolver 与冲突优先级，含 §9.2 归属规则。
- [ ] 实现 `validateParameters()`，先覆盖 S2 案例。
- [ ] 实现 `getModel` / `getOffering` / `findModels` / `supports` / `resolveModel`。
- [ ] 加入引用完整性、唯一 ID、快照可重复构建校验。
- [ ] 写负向测试：互斥参数、未知能力、上游缺失字段。
- [ ] README 明确"Catalog 不负责调用模型，也不授予权限"。

### V0.1 完成定义

1. 离线可读取模型及服务商元数据。
2. 同一模型对应两个 Offering，返回不同价格 / 能力覆盖。
3. 无法确认的能力明确返回 `unknown`。
4. 给定一个 Agent 能力需求，可生成可解释的通过 / 拒绝结果。
5. S2 场景（思考开启 + temperature）能被拦下并给出中文原因。
6. CI 能检测坏数据、引用错误与不可重复构建。
7. Cyrene 通过 workspace 依赖该包，且包内无 Electron 依赖。
8. 上游字段漂移时构建失败并告警。

---

## 13. 关键决策记录

| 决策 | 选项 | 原因 |
|---|---|---|
| 数据底座 | models.dev + 本地覆盖 | 上游已维护同类数据并打通跨 Provider 同一性，自建采集无优势 |
| 数据存储 | 原始 JSON + 生成只读索引 | 便于审查、Diff、离线、按包发布 |
| 数据校验 | Zod 4 | 与 Cyrene TS 技术栈一致，运行时可校验 |
| 模型结构 | Model / Provider / Offering 分离 | 与 models.dev 分层对齐，避免能力与供应混淆 |
| 能力状态 | 三态 | 上游 boolean 无法表达"不确定"，三态是核心增益 |
| 参数表达 | 结构体 + 跨参数约束 | 真实报错来自互斥组合而非单参数不支持 |
| 运行时 | 纯 TS、构建期快照、无网络副作用 | Electron / Node / 浏览器共用 |
| 能力真源 | AI SDK Adapter 优先，Catalog 保守兜底 | 避免目录与实现漂移后误判 |
| 本地模型 | 运行时探测，不入静态目录 | 静态手写会立刻过期 |
| 许可证 | MIT（暂定，待核对数据条款） | 简洁、生态复用友好 |

---

## 14. 待决问题

1. **数据分发条款**：models.dev 的数据能否随包分发？若不能，是否接受"构建期拉取、用户侧生成快照"？
2. **首批范围**：哪 5–8 家开发商？是否包含 OpenRouter 之外的聚合商（Bedrock / Vertex / Azure）？
3. **快照更新方式**：V0.1 仅随 App 更新，还是需要在线增量更新？后者会显著增加安全设计成本。
4. **参数校验边界**：AI SDK 已经归一化的部分我们不再重复记录，这个边界的判定标准需要在实现时逐项核对。
5. **价格准确性承诺**：UI 是否标注抓取时间与"以服务商实际账单为准"（建议必须标注）。

**建议默认答案**：先确认第 1 项；首批只收主流官方 API + OpenRouter；快照仅随 App 更新；所有 AI SDK 已处理的参数差异不重复记录；价格必须显示来源与更新时间。

---

## 15. 最终建议

**先把 Resolver 做对，再考虑扩充模型数量。**

对 Cyrene 本地 Agent 工作台来说，价值不在于"收录几千个模型"，而在于：模型能力能否驱动正确的 Runtime 选择、参数配置、工具调用与错误提示。

**实施顺序**：`场景 → Schema → models.dev 接入 → Resolver + 参数校验 → 单元测试 → Cyrene 接入 → overrides 与证据`。
