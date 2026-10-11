# @playa0v0/model-catalog

离线可用的模型元数据与能力解析层。给 Harness / Agent 客户端回答一个问题：

> 某个模型，在某个渠道上，到底有哪些能力？

包本身**不做任何网络请求、不保存密钥、不授予任何权限**。工具执行、文件修改、系统命令的审批仍然属于 Harness。

数据底座是 [models.dev](https://models.dev/api.json) 的公开快照，构建期抓取并按白名单过滤，运行时只读一份纯数据模块。

---

## 覆盖范围

| 项 | 值 |
|---|---|
| 厂商 | openai、anthropic、glm、kimi、deepseek、豆包 Seed（字节跳动）、阿里、小米、minimax、Gemini、Xai（共 11 家） |
| 渠道 | 30 个（15 个按量付费渠道 + 14 个套餐渠道 + 1 个手工维护的 Agent Plan 渠道） |
| 模型 | 394 个 |
| Offering | 519 条（同一模型在不同渠道上的可调用记录） |

厂商记的是**渠道的运营方**，模型的实际出品方看 `ModelDefinition.lab`。这一点在聚合平台上尤其重要：
火山方舟既是豆包 Seed 自家模型的入口，也托管 DeepSeek、智谱的模型，一共来自 3 个实验室。

「模型」与「Offering」是分开的两个概念：

- **Model**（`ModelDefinition`）是模型本身的固有属性，ID 形如 `openai/gpt-4o`。
- **Offering**（`ModelOffering`）是「某模型在某渠道上的一次可调用」，ID 形如 `openai/gpt-4o`。
  同一模型被多个渠道提供时会有多条 offering，各自的能力可能不同。

上游维护的套餐渠道（`*-coding-plan` / `*-token-plan`）与厂商主体是同一套 API 表面，只是计费方式不同，
因此不单独维护能力规则——构建时回落到该厂商主渠道的规则。也就是说这些渠道上的能力结论
尚未逐条实测，是按厂商主体推定的；哪天真去用了并发现差异，再补例外规则。

渠道的 `apiBase` 保存上游提供的默认 API 根地址；`protocolBaseURLs` 可以分别记录 Chat Completions、Anthropic Messages 与 Responses API 的根地址。SDK 默认协议映射基于渠道记录的 `sdkPackage` 与 `apiBase`，其他协议只有在对应厂商资料明确支持时，才写入 `data/vendors/<vendor>.ts` 的 `ENDPOINT_RULES`，并带 `confidence` 与 `source`。协议根地址只按具体渠道记录，不因同厂商、地区或套餐相同而自动复用。例如 DeepSeek 的 Chat Completions 和 Responses 共用 `https://api.deepseek.com`，Anthropic Messages 使用 `https://api.deepseek.com/anthropic`。

**火山方舟 Agent Plan 是例外**：上游快照里没有这个渠道，由 `data/manual-channels.ts` 手工维护，
能力结论全部来自实测。它的入口是 `/api/plan`，按量付费的火山渠道是 `/api/v3`，路径不同，
两边的实测结论不能互相外推，因此它不参与「按厂商回落」那条链路。

---

## 能力三态

上游 models.dev 用 boolean 表达能力，无法区分「确定不支持」和「没人确认过」。本包把它扩成三态：

| 取值 | 含义 |
|---|---|
| `supported` | 有依据确认支持 |
| `unsupported` | 有依据确认不支持 |
| `unknown` | 缺少可核验依据 |

**字段缺失必须映射为 `unknown`，不得默认成 `unsupported`**，这是本包相对上游的核心增益。

可查询的能力路径见 `CAPABILITY_PATHS`，包括流式、工具调用、并行工具、流式工具、`tool_choice` 四种取值、结构化输出、推理、提示缓存、厂商托管工具（联网搜索 / 代码执行）。

---

## 四层解析

能力结论按优先级从低到高逐层合并，`resolveModel` 会保留每一层的原始结论与面向用户的理由：

1. **model** —— 模型固有属性
2. **offering** —— 渠道对默认值的覆盖
3. **adapter** —— AI SDK Adapter 实际实现的能力
4. **user** —— 用户在设置里关掉的能力

仲裁规则：

- Adapter 报 `unsupported` **一票否决**，无论渠道怎么说。
- Adapter 报 `supported` 但渠道明确 `unsupported` 时，取更保守的 `unsupported`。
- Adapter 报 `unknown` 而渠道 `supported` 时，降级为 `unknown`（Adapter 未声明即不能当可用）。
- 用户层**只能收紧**，不能绕过硬限制。

---

## 数据缺口（本包人工补的部分）

models.dev 完全没有以下几类字段，全部由 `data/vendors/` 下各厂商自己的文件补齐（`data/capability-overrides.ts` 只做汇总）：

| 缺口 | 说明 |
|---|---|
| 工具选择 `tool_choice` | 上游无此字段 |
| 并行工具 | 上游无此字段 |
| 流式工具 | 上游无此字段；注意它 ≠ 流式输出 |
| 厂商托管工具 | 原生联网搜索 / 厂商侧代码执行 |
| 提示缓存 | prompt caching 的可用性 |

**暂不覆盖**（第一版刻意不做）：价格、`top_p` 等非核心采样参数、模型生命周期之外的运营信息。生图 / 生视频参数同样不在范围内，只记录输入输出模态。

每条人工规则都带 `confidence` 与 `source`：

- `verified` —— 有官方文档可引用，来源写在 `source` 里
- `inferred` —— 依据协议形态或公开资料推断，尚未逐条核验

构建脚本会把所有规则打印成审计清单，凡是 `inferred` 或 `unknown` 都值得人工再看一遍。不确定就写 `unknown`，不要为了「好看」填 `supported`。

---

## 审计清单（当前版本）

15 条上游渠道规则全部为 `verified`，逐条来源见构建输出与各厂商文件里的 `source` 字段；
表末的 Agent Plan 渠道不走上游，结论来自实测。摘要：

| 渠道 | 工具选择 | 并行 | 流式工具 | 托管工具 | 提示缓存 | 依据 |
|---|---|---|---|---|---|---|
| openai | auto/required/none/指定 | 支持 | 支持 | web_search、code_execution | 支持 | platform.openai.com |
| anthropic | auto/none/any/tool | 支持 | 支持 | web_search、code_execution | 支持 | docs.anthropic.com |
| zai / zhipuai | 仅 auto | 支持※ | 支持 | web_search | 支持 | docs.bigmodel.cn |
| moonshotai / -cn | 四种 | 支持 | 支持 | web_search、code_execution | 支持 | platform.moonshot.cn |
| deepseek | auto/required/指定 | 支持 | 支持 | 无 | 支持 | DeepSeek 文档 |
| volcengine | 未知 | 支持 | 豆包支持 | web_search | 支持 | 火山方舟文档 |
| alibaba / -cn | 四种 | 支持 | 支持 | web_search、code_execution | 支持 | 阿里云百炼文档 |
| xiaomi | 仅 auto | 支持 | 支持 | web_search（仅 v2.5+） | 未知 | mimo.mi.com |
| minimax / -cn | auto/none | 支持 | 支持 | web_search | 支持 | platform.minimax.io |
| google | 四种 | 支持 | 支持 | web_search、code_execution | 支持 | ai.google.dev |
| xai | 四种 | 支持 | **不支持** | web_search | 未知 | docs.x.ai |
| volcengine-agent-plan | 四种（按模型有别） | 支持（m3 除外） | 支持（m3 除外） | 未知 | 未知 | 实测 |

「工具选择」列写的是厂商原生取值：Anthropic 的 `any` 对应本包的 `required`，`tool` 对应 `specific`。

※ 智谱的并行工具调用凭据弱于表内其它项：函数调用正文页只写了 `tool_choice` 仅支持 `auto`，
并未正面描述并行；`supported` 来自官方 Codex 接入页模型元数据里的 `supports_parallel_tool_calls: true`，
以及文档助手与开发者反馈的「始终开启、无法关闭」。

其中 xAI 明确写明流式场景下函数调用整段返回、不做跨 chunk 增量，因此 `tools.streaming` 记为 `unsupported`。

小米与 MiniMax 的流式工具在文档里都查不到，改用实测确认：发一次带长参数的流式工具调用，
看 `arguments` 是否分散在多个事件里。结果两家都是分片返回（小米 19 片、MiniMax 3 片与 2 片），
因此记为 `supported`——凭据是实测而非文档。

实测还暴露了一个建模边界：小米的三套协议行为不一致。`chat/completions` 与 `/v1/responses`
都是分片增量，但 Anthropic 兼容端点 `/anthropic/v1/messages` 一次性返回整段 JSON。
目录按渠道主体——也就是 AI SDK 默认走的 `chat/completions` 路径——记为 `supported`；
用 Anthropic 协议接入 MiMo 时属已知例外，不要依赖增量。

小米的联网搜索只有 v2.5 / v2.6 两代模型可用，因此写在 `OFFERING_RULES` 里按模型名匹配，
而不是渠道级规则；v2 系列老模型保持 `unknown`。

火山方舟 Agent Plan 的 13 个模型用两套兼容协议各测了一轮，结论如下：
SSE 流式、工具调用与 `tool_choice=auto` 全部支持；并行工具与流式工具除 `minimax-m3`（只发 1 个调用、整段返回）外都支持；
`tool_choice=required` 除 `kimi-k2.7-code` 外都支持；
`tool_choice=none` 在 `doubao-seed-evolving`、`doubao-seed-2.1-pro`、`glm-5.3-flash` 上实测仍会调用工具，记为 `unsupported`；
指定具体工具在三个 Kimi 模型上都返回 HTTP 400，`glm-5.3` 两套协议结论打架，保持 `unknown`。
结构化输出、推理、提示缓存、托管工具这几类没测，一律留 `unknown`。

其中 `doubao-seed-2.1-lite` 上游快照里没有，已在 `data/manual-channels.ts` 里手工补成模型
`bytedance-seed/seed-2.1-lite`；它的模态沿用同代 Seed 2.1，上下文与输出上限无依据，留空。

---

## 开发

从 Git（版本管理工具）仓库安装时，固定完整提交编号，安装准备阶段通过 `prepare`（安装准备脚本）编译已提交的快照并输出 `dist`。此阶段不刷新 models.dev，也不调用模型接口。包自身的编译依赖由仓库锁文件记录，消费方不需要复制源目录或使用自己的编译器构建本包。

包入口和类型入口均指向编译产物。干净仓库安装需要允许本包的准备脚本执行；安装失败时检查构建输出，不依赖本机已有 `dist`。维护人工规则时才运行下方的生成命令，普通安装与编译不生成新快照。

```bash
npm run build:catalog   # 抓取 models.dev 快照并生成 src/generated/catalog.ts
npm run refresh:catalog # 同上，忽略本地缓存强制重新拉取
npm run validate        # 校验生成物：引用完整性、唯一性、三态取值、排序确定性
npm run typecheck       # tsc --noEmit，覆盖 src / data / scripts / tests
npm test                # node --test，离线运行
npm run build           # 输出 dist
```

运行时零依赖，`devDependencies` 只有 TypeScript。脚本与测试都用 Node 原生跑 TypeScript，不需要 tsx / vitest。

---

## 许可

本包自身以 MIT 发布，见 [LICENSE](./LICENSE)。

数据来自 [models.dev](https://models.dev)，同样以 MIT 分发（Copyright (c) 2025 models.dev）。
快照在构建期抓取并编译进产物，发布出去的包运行时不联网、不依赖 models.dev 的在线服务。
