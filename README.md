# @limea/model-catalog

离线可用的模型元数据与能力解析层。给 Harness / Agent 客户端回答一个问题：

> 某个模型，在某个渠道上，到底有哪些能力？

包本身**不做任何网络请求、不保存密钥、不授予任何权限**。数据底座是 [models.dev](https://models.dev/api.json) 的公开快照，构建期抓取并按白名单过滤，运行时只读一份纯数据模块。

| 项 | 值 |
|---|---|
| 厂商 | openai、anthropic、glm、kimi、deepseek、豆包 Seed（字节跳动）、阿里、小米、minimax、Gemini、Xai（共 11 家） |
| 渠道 | 30 个（15 个按量付费渠道 + 14 个套餐渠道 + 1 个手工维护的 Agent Plan 渠道） |
| 模型 | 390 个 |
| Offering | 515 条（同一模型在不同渠道上的可调用记录） |

字段含义、四层解析、协议地址与审计清单等实现细节见 [AGENT.md](./AGENT.md)；下方是完整模型清单，维护源为 [`docs/模型清单.md`](./docs/模型清单.md)。

---

> 说明：只保留语言模型；已弃用 / 已退役 / 已下线的模型已剔除。
> 推理参数与关闭思考按官方资料结果填写，不再要求 API 实测。
> 多模态能力 = 输入类型（文字 / 图片 / 视频 / 音频 / PDF 文档）；原生能力 = 结构化输出（JSON Schema）/ 原生联网搜索。

## OpenAI（openai）

### OpenAI（openai，34 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| gpt-4.1 | GPT-4.1 | active | 否 | — | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-04-14 |
| gpt-4.1-mini | GPT-4.1 mini | active | 否 | — | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-04-14 |
| gpt-4o | GPT-4o | active | 否 | — | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2024-08-06 |
| gpt-4o-2024-08-06 | GPT-4o (2024-08-06) | active | 否 | — | — | 文字、图片 | 结构化输出、原生联网搜索 | 2024-08-06 |
| gpt-4o-2024-11-20 | GPT-4o (2024-11-20) | active | 否 | — | — | 文字、图片 | 结构化输出、原生联网搜索 | 2024-11-20 |
| gpt-4o-mini | GPT-4o mini | active | 否 | — | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2024-07-18 |
| gpt-5 | GPT-5 | active | 是 | minimal / low / medium / high | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-08-07 |
| gpt-5-mini | GPT-5 Mini | active | 是 | minimal / low / medium / high | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-08-07 |
| gpt-5-nano | GPT-5 Nano | active | 是 | minimal / low / medium / high | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-08-07 |
| gpt-5-pro | GPT-5 Pro | active | 是 | high | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-10-06 |
| gpt-5.1 | GPT-5.1 | active | 是 | none / low / medium / high | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-11-13 |
| gpt-5.2 | GPT-5.2 | active | 是 | none / low / medium / high / xhigh | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-12-11 |
| gpt-5.2-pro | GPT-5.2 Pro | active | 是 | medium / high / xhigh | — | 文字、图片 | 原生联网搜索 | 2025-12-11 |
| gpt-5.3-codex | GPT-5.3 Codex | active | 是 | none / low / medium / high / xhigh | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-02-05 |
| gpt-5.3-codex-spark | GPT-5.3 Codex Spark | active | 是 | none / low / medium / high / xhigh | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-02-05 |
| gpt-5.4 | GPT-5.4 | active | 是 | none / low / medium / high / xhigh | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-03-05 |
| gpt-5.4-mini | GPT-5.4 mini | active | 是 | none / low / medium / high / xhigh | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-03-17 |
| gpt-5.4-nano | GPT-5.4 nano | active | 是 | none / low / medium / high / xhigh | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-03-17 |
| gpt-5.4-pro | GPT-5.4 Pro | active | 是 | medium / high / xhigh | — | 文字、图片 | 原生联网搜索 | 2026-03-05 |
| gpt-5.5 | GPT-5.5 | active | 是 | none / low / medium / high / xhigh | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-04-23 |
| gpt-5.5-pro | GPT-5.5 Pro | active | 是 | medium / high / xhigh | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-04-23 |
| gpt-5.6 | GPT-5.6 Sol | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-07-09 |
| gpt-5.6-luna | GPT-5.6 Luna | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-07-09 |
| gpt-5.6-sol | GPT-5.6 Sol | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-07-09 |
| gpt-5.6-terra | GPT-5.6 Terra | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-07-09 |
| gpt-6-astra | GPT-6 Astra | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-04 |
| gpt-6-luna | GPT-6 Luna | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-22 |
| gpt-6-sol | GPT-6 Sol | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-22 |
| gpt-6.1-sol | GPT-6.1 Sol | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-29 |
| gpt-daybreak-blue-latest | GPT-5.6 Sol | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-07-09 |
| gpt-daybreak-red-latest | Daybreak Red | active | 是 | none / low / medium / high / xhigh / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-08-07 |
| gpt-realtime-2.1 | GPT-Realtime-2.1 | active | 是 | minimal / low / medium / high / xhigh | — | 文字、图片、音频 | 原生联网搜索 | 2026-07-06 |
| o3 | o3 | active | 是 | low / medium / high | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-04-16 |
| o3-pro | o3-pro | active | 是 | low / medium / high | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-06-10 |

## Anthropic（anthropic）

### Anthropic（anthropic，17 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| claude-fable-5 | Claude Fable 5 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-06-09 |
| claude-fable-5-1 | Claude Fable 5.1 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-01 |
| claude-haiku-4-5 | Claude Haiku 4.5 (latest) | active | 是 | 预算：thinking.type=enabled + budget_tokens≥1024 | 可以：省略 thinking 或设 `thinking.type=disabled` | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-10-15 |
| claude-haiku-4-5-20251001 | Claude Haiku 4.5 | active | 是 | 预算：thinking.type=enabled + budget_tokens≥1024 | 可以：省略 thinking 或设 `thinking.type=disabled` | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-10-15 |
| claude-haiku-5-5 | Claude Haiku 5.5 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-10-07 |
| claude-opus-4-5 | Claude Opus 4.5 (latest) | active | 是 | low / medium / high | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-11-24 |
| claude-opus-4-5-20251101 | Claude Opus 4.5 | active | 是 | low / medium / high | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-11-01 |
| claude-opus-4-6 | Claude Opus 4.6 | active | 是 | low / medium / high / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-03-13 |
| claude-opus-4-7 | Claude Opus 4.7 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-04-16 |
| claude-opus-4-8 | Claude Opus 4.8 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-05-28 |
| claude-opus-5 | Claude Opus 5 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-07-24 |
| claude-opus-5-5 | Claude Opus 5.5 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-22 |
| claude-sonnet-4-5 | Claude Sonnet 4.5 (latest) | active | 是 | 预算：thinking.type=enabled + budget_tokens≥1024 | 可以：省略 thinking 或设 `thinking.type=disabled` | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-09-29 |
| claude-sonnet-4-5-20250929 | Claude Sonnet 4.5 | active | 是 | 预算：thinking.type=enabled + budget_tokens≥1024 | 可以：省略 thinking 或设 `thinking.type=disabled` | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2025-09-29 |
| claude-sonnet-4-6 | Claude Sonnet 4.6 | active | 是 | low / medium / high / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-03-13 |
| claude-sonnet-5 | Claude Sonnet 5 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-06-30 |
| claude-sonnet-5-5 | Claude Sonnet 5.5 | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-28 |

## 智谱 GLM（glm）

### Z.ai（智谱国际站）（zai，18 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| glm-4.5 | GLM-4.5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-07-28 |
| glm-4.5-air | GLM-4.5-Air | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-07-28 |
| glm-4.5-flash | GLM-4.5-Flash | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-07-28 |
| glm-4.5v | GLM-4.5V | active | 是 | 强制思考（无档位） | 不可关 | 文字、图片、视频 | 原生联网搜索 | 2025-08-11 |
| glm-4.6 | GLM-4.6 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-09-30 |
| glm-4.6v | GLM-4.6V | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字、图片、视频 | 原生联网搜索 | 2025-12-08 |
| glm-4.6v-flash | GLM-4.6V-Flash | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字、图片、视频 | 原生联网搜索 | 2025-12-08 |
| glm-4.7 | GLM-4.7 | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2025-12-22 |
| glm-4.7-flash | GLM-4.7-Flash | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2026-01-19 |
| glm-4.7-flashx | GLM-4.7-FlashX | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2026-01-19 |
| glm-5 | GLM-5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2026-02-11 |
| glm-5-turbo | GLM-5-Turbo | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-03-16 |
| glm-5.1 | GLM-5.1 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-03-27 |
| glm-5.2 | GLM-5.2 | active | 是 | high / max | 可以（传 none/minimal 即关） | 文字 | 结构化输出、原生联网搜索 | 2026-06-13 |
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |
| glm-5.3-flash | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-09-18 |
| glm-5.3-flashx | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-09-18 |
| glm-5v-turbo | GLM-5V-Turbo | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字、图片、PDF文档、视频 | 原生联网搜索 | 2026-04-01 |

### 智谱开放平台（zhipuai，17 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| glm-4.5 | GLM-4.5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-07-28 |
| glm-4.5-air | GLM-4.5-Air | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-07-28 |
| glm-4.5-flash | GLM-4.5-Flash | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-07-28 |
| glm-4.5v | GLM-4.5V | active | 是 | 强制思考（无档位） | 不可关 | 文字、图片、视频 | 原生联网搜索 | 2025-08-11 |
| glm-4.6 | GLM-4.6 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2025-09-30 |
| glm-4.6v | GLM-4.6V | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字、图片、视频 | 原生联网搜索 | 2025-12-08 |
| glm-4.6v-flash | GLM-4.6V-Flash | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字、图片、视频 | 原生联网搜索 | 2025-12-08 |
| glm-4.7 | GLM-4.7 | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2025-12-22 |
| glm-4.7-flash | GLM-4.7-Flash | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2026-01-19 |
| glm-4.7-flashx | GLM-4.7-FlashX | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2026-01-19 |
| glm-5 | GLM-5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2026-02-11 |
| glm-5.1 | GLM-5.1 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-03-27 |
| glm-5.2 | GLM-5.2 | active | 是 | high / max | 可以（传 none/minimal 即关） | 文字 | 结构化输出、原生联网搜索 | 2026-06-13 |
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |
| glm-5.3-flash | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-09-18 |
| glm-5.3-flashx | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-09-18 |
| glm-5v-turbo | GLM-5V-Turbo | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字、图片、PDF文档、视频 | 原生联网搜索 | 2026-04-01 |

### Z.ai Coding Plan（zai-coding-plan，2 个）

> 官方说明：所有套餐均支持 GLM-5.3、GLM-5.3-Flash；调用历史模型 GLM-5.2 / GLM-5.1 将自动切换至 GLM-5.3，GLM-5-Turbo / GLM-4.7 将自动切换至 GLM-5.3-Flash。此处仅保留实际可用的 GLM-5.3 / GLM-5.3-Flash。

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |
| glm-5.3-flash | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-09-18 |

### 智谱 Coding Plan（zhipuai-coding-plan，3 个）

> 官方说明：所有套餐均支持 GLM-5.3、GLM-5.3-Flash；调用历史模型 GLM-5.2 / GLM-5.1 将自动切换至 GLM-5.3，GLM-5-Turbo / GLM-4.7 将自动切换至 GLM-5.3-Flash（表内历史模型为上游快照，实际已归并到 5.3 系列）。

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |
| glm-5.3-flash | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-09-18 |
| glm-5.3-highspeed | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |

## Kimi（kimi）

### Moonshot 国际站（moonshotai，4 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.6 | Kimi K2.6 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：thinking.type=disabled | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-21 |
| kimi-k2.7-code | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-12 |
| kimi-k2.7-code-highspeed | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-12 |
| kimi-k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-07-16 |

### Moonshot 中国站（moonshotai-cn，4 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.6 | Kimi K2.6 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：thinking.type=disabled | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-21 |
| kimi-k2.7-code | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-12 |
| kimi-k2.7-code-highspeed | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-12 |
| kimi-k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-07-16 |

### Kimi Code Plan（中国站）（kimi-code-plan-cn，3 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-07-16 |
| k3-256k | Kimi K3 | active | 是 | low / high / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-07-16 |
| kimi-for-coding | kimi-for-coding | active | 是 | low / high / max | — | 文字、图片、视频 | 原生联网搜索 | 2026-09-11 |

### Kimi Code Plan（国际站）（kimi-code-plan-global，3 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-07-16 |
| k3-256k | Kimi K3 | active | 是 | low / high / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-07-16 |
| kimi-for-coding | kimi-for-coding | active | 是 | low / high / max | — | 文字、图片、视频 | 原生联网搜索 | 2026-09-11 |

## DeepSeek（deepseek）

### DeepSeek（deepseek，2 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| deepseek-flash | DeepSeek V4 Flash | active | 是 | low / high / max | — | 文字、图片 | 结构化输出 | 2026-09-10 |
| deepseek-v4-pro | DeepSeek V4 Pro | active | 是 | low / high / max | — | 文字 | 结构化输出 | 2026-08-22 |

## 字节 豆包（火山方舟）（bytedance）

### 火山方舟（volcengine，13 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| deepseek-v4-flash-ga-260731 | DeepSeek V4 Flash 0731 | active | 是 | minimal / low / medium / high | — | 文字 | 结构化输出、原生联网搜索 | 2026-07-31 |
| deepseek-v4-pro-ga-260813 | DeepSeek V4 Pro | active | 是 | low / high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-08-22 |
| doubao-seed-1-8-251228 | Seed 1.8 | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2025-12-28 |
| doubao-seed-2-0-code-preview-260215 | Seed 2.0 Code | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-02-14 |
| doubao-seed-2-0-lite-260428 | Seed 2.0 Lite | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-02-14 |
| doubao-seed-2-0-mini-260428 | Seed 2.0 Mini | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-02-14 |
| doubao-seed-2-0-pro-260215 | Seed 2.0 Pro | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-02-14 |
| doubao-seed-2-1-pro-260628 | Seed 2.1 Pro | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-23 |
| doubao-seed-2-1-turbo-260628 | Seed 2.1 Turbo | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-23 |
| doubao-seed-character-260628 | Seed Character | active | 是 | minimal / low / high | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-23 |
| doubao-seed-evolving | Seed Evolving | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-23 |
| glm-5-2-260617 | GLM-5.2 | active | 是 | high / max | 可以（传 none/minimal 即关） | 文字 | 结构化输出、原生联网搜索 | 2026-06-13 |
| glm-5-3-flash-260828 | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-09-18 |

### 火山方舟 Coding Plan（volcengine-coding-plan，10 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| deepseek-v4-flash | DeepSeek V4 Flash | active | 是 | high / max | — | 文字 | 结构化输出 | 2026-04-24 |
| deepseek-v4-pro | DeepSeek V4 Pro | active | 是 | high / max | — | 文字 | 结构化输出 | 2026-04-24 |
| doubao-seed-2.0-lite | Seed 2.0 Lite | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出 | 2026-02-14 |
| doubao-seed-2.1-turbo | Seed 2.1 Turbo | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出 | 2026-06-23 |
| doubao-seed-evolving | Seed Evolving | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | 结构化输出 | 2026-06-23 |
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出 | 2026-08-14 |
| glm-5.3-flash | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | 结构化输出 | 2026-09-18 |
| kimi-k2.7-code | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | 结构化输出 | 2026-06-12 |
| kimi-k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片、视频 | 结构化输出 | 2026-07-16 |
| minimax-m3 | MiniMax-M3 | active | 是 | 开关：thinking.type=adaptive/disabled | 是 | 文字、图片、视频 | — | 2026-06-25 |

### 火山方舟 Agent Plan（volcengine-agent-plan，13 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| deepseek-v4-flash | DeepSeek V4 Flash | active | 是 | high / max | — | 文字 | — | 2026-04-24 |
| deepseek-v4-pro | DeepSeek V4 Pro | active | 是 | high / max | — | 文字 | — | 2026-04-24 |
| deepseek-v4.1-flash | DeepSeek V4 Flash | active | 是 | low / high / max | — | 文字、图片 | — | 2026-09-10 |
| doubao-seed-2.0-mini | Seed 2.0 Mini | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | — | 2026-02-14 |
| doubao-seed-2.1-lite | Seed 2.1 Lite | active | 是 | 开关：thinking.type=enabled/disabled | 可以：thinking.type=disabled | 文字、图片、视频 | — | — |
| doubao-seed-2.1-pro | Seed 2.1 Pro | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | — | 2026-06-23 |
| doubao-seed-evolving | Seed Evolving | active | 是 | none / minimal / low / medium / high / xhigh / max | — | 文字、图片、视频 | — | 2026-06-23 |
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | — | 2026-08-14 |
| glm-5.3-flash | GLM-5.3-FlashX | active | 是 | low / high / max | 不可关（仅能开启） | 文字、图片、PDF文档、视频 | — | 2026-09-18 |
| kimi-k2.7-code | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | — | 2026-06-12 |
| kimi-k2.8-preview | kimi-for-coding | preview | 是 | low / high / max | — | 文字、图片、视频 | — | 2026-09-11 |
| kimi-k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片、视频 | — | 2026-07-16 |
| minimax-m3 | MiniMax-M3 | active | 是 | 开关：thinking.type=adaptive/disabled | 是 | 文字、图片、视频 | — | 2026-06-25 |

## 阿里 通义（alibaba）

### 阿里云百炼（国际站）（alibaba，55 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| deepseek-v4-flash-0731 | DeepSeek V4 Flash 0731 | active | 是 | minimal / low / medium / high | — | 文字 | 结构化输出、原生联网搜索 | 2026-07-31 |
| glm-5.2 | GLM-5.2 | active | 是 | high / max | 可以（传 none/minimal 即关） | 文字 | 结构化输出、原生联网搜索 | 2026-06-13 |
| kimi-k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-07-16 |
| qvq-max | QVQ Max | active | 是 | 强制思考（无公开关闭参数） | 不支持公开关闭参数 | 文字、图片 | 原生联网搜索 | 2025-03-25 |
| qwen-flash | Qwen Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-07-28 |
| qwen-max | Qwen Max | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01-25 |
| qwen-mt-plus | Qwen-MT Plus | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01 |
| qwen-mt-turbo | Qwen-MT Turbo | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01 |
| qwen-omni-turbo | Qwen-Omni Turbo | active | 否 | — | — | 文字、图片、音频、视频 | 原生联网搜索 | 2025-03-26 |
| qwen-omni-turbo-realtime | Qwen-Omni Turbo Realtime | active | 否 | — | — | 文字、图片、音频 | 原生联网搜索 | 2025-05-08 |
| qwen-plus | Qwen Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-09-11 |
| qwen-plus-character-ja | Qwen Plus Character (Japanese) | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-01 |
| qwen-turbo | Qwen Turbo | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04-28 |
| qwen-vl-max | Qwen-VL Max | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2025-08-13 |
| qwen-vl-ocr | Qwen-VL OCR | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2025-04-13 |
| qwen-vl-plus | Qwen-VL Plus | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2025-08-15 |
| qwen2-5-14b-instruct | Qwen2.5 14B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-32b-instruct | Qwen2.5 32B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-72b-instruct | Qwen2.5 72B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-7b-instruct | Qwen2.5 7B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-omni-7b | Qwen2.5-Omni 7B | active | 否 | — | — | 文字、图片、音频、视频 | 原生联网搜索 | 2024-12 |
| qwen2-5-vl-72b-instruct | Qwen2.5-VL 72B Instruct | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2024-09 |
| qwen2-5-vl-7b-instruct | Qwen2.5-VL 7B Instruct | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2024-09 |
| qwen3-14b | Qwen3 14B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-235b-a22b | Qwen3 235B-A22B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-32b | Qwen3 32B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-8b | Qwen3 8B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-coder-30b-a3b-instruct | Qwen3-Coder 30B-A3B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-coder-480b-a35b-instruct | Qwen3-Coder 480B-A35B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-coder-flash | Qwen3 Coder Flash | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-07-28 |
| qwen3-coder-plus | Qwen3 Coder Plus | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-07-23 |
| qwen3-max | Qwen3 Max | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-09-23 |
| qwen3-next-80b-a3b-instruct | Qwen3-Next 80B-A3B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-09 |
| qwen3-next-80b-a3b-thinking | Qwen3-Next 80B-A3B (Thinking) | active | 是 | 强制思考（thinking_budget 可调上限） | 否 | 文字 | 原生联网搜索 | 2025-09 |
| qwen3-omni-flash | Qwen3-Omni Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、音频、视频 | 原生联网搜索 | 2025-09-15 |
| qwen3-omni-flash-realtime | Qwen3-Omni Flash Realtime | active | 否 | — | — | 文字、图片、音频、视频 | 原生联网搜索 | 2025-09-15 |
| qwen3-vl-plus | Qwen3-VL Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片 | 原生联网搜索 | 2025-09-23 |
| qwen3.5-122b-a10b | Qwen3.5 122B-A10B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-02-23 |
| qwen3.5-27b | Qwen3.5 27B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-02-23 |
| qwen3.5-35b-a3b | Qwen3.5 35B-A3B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-02-23 |
| qwen3.5-397b-a17b | Qwen3.5 397B-A17B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-02-15 |
| qwen3.5-flash | Qwen3.5 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-02-23 |
| qwen3.5-plus | Qwen3.5 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-02-16 |
| qwen3.6-27b | Qwen3.6 27B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 是 | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-04-22 |
| qwen3.6-35b-a3b | Qwen3.6 35B-A3B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 是 | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-04-17 |
| qwen3.6-flash | Qwen3.6 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-27 |
| qwen3.6-max-preview | Qwen3.6 Max Preview | active | 是 | 开关+预算：enable_thinking；thinking_budget | 是 | 文字 | 原生联网搜索 | 2026-04-20 |
| qwen3.6-plus | Qwen3.6 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-04-02 |
| qwen3.7-flash | Qwen3.7 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-07-15 |
| qwen3.7-max | Qwen3.7 Max | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2026-05-21 |
| qwen3.7-plus | Qwen3.7 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-04 |
| qwen3.8-flash | Qwen3.8 Flash | active | 是 | low / medium / xhigh | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-08-26 |
| qwen3.8-max | Qwen3.8 Max | active | 是 | low / medium / xhigh | — | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-08-03 |
| qwen3.8-omni-flash | Qwen3.8 Omni Flash | active | 是 | none / low / medium / xhigh | — | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-09-17 |
| qwq-plus | QwQ Plus | active | 是 | 强制思考（无公开关闭参数） | 不可以（仅思考） | 文字 | 原生联网搜索 | 2025-03-05 |

### 阿里云百炼（中国站）（alibaba-cn，88 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M2.5 | MiniMax-M2.5 | active | 是 | 强制思考（无公开档位） | 不可以（仅思考） | 文字 | 原生联网搜索 | 2026-02-12 |
| MiniMax/MiniMax-M2.7 | MiniMax-M2.7 | active | 是 | 强制思考（无公开档位） | 否 | 文字 | 原生联网搜索 | 2026-03-18 |
| deepseek-r1 | DeepSeek R1 | active | 是 | 强制思考（不支持关闭） | 否 | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-r1-0528 | DeepSeek R1 0528 | active | 是 | 强制思考（不支持关闭） | 否 | 文字 | 原生联网搜索 | 2025-05-28 |
| deepseek-r1-distill-llama-70b | DeepSeek R1 Distill Llama 70B | active | 是 | 强制思考（蒸馏系列） | 否 | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-r1-distill-llama-8b | DeepSeek R1 Distill Llama 8B | active | 是 | 强制思考（蒸馏系列） | 否 | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-r1-distill-qwen-1-5b | DeepSeek R1 Distill Qwen 1.5B | active | 是 | 强制思考（蒸馏系列） | 否 | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-r1-distill-qwen-14b | DeepSeek R1 Distill Qwen 14B | active | 是 | 强制思考（蒸馏系列） | 否 | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-r1-distill-qwen-32b | DeepSeek R1 Distill Qwen 32B | active | 是 | 强制思考（蒸馏系列） | 否 | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-r1-distill-qwen-7b | DeepSeek R1 Distill Qwen 7B | active | 是 | 强制思考（蒸馏系列） | 否 | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-v3 | DeepSeek V3 | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-12-01 |
| deepseek-v3-1 | DeepSeek V3.1 | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-v3-2-exp | DeepSeek V3.2 Exp | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01-01 |
| deepseek-v4-flash | DeepSeek V4 Flash | active | 是 | high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-04-24 |
| deepseek-v4-pro | DeepSeek V4 Pro | active | 是 | high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-04-24 |
| deepseek-v4.1-flash | DeepSeek V4 Flash | active | 是 | low / high / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-09-10 |
| glm-5 | GLM-5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2026-02-11 |
| glm-5.1 | GLM-5.1 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-04-14 |
| glm-5.2 | GLM-5.2 | active | 是 | high / max | 可以（传 none/minimal 即关） | 文字 | 结构化输出、原生联网搜索 | 2026-06-13 |
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |
| kimi-k2-thinking | Moonshot Kimi K2 Thinking | active | 是 | 强制思考（无关闭档位） | 否 | 文字 | 结构化输出、原生联网搜索 | 2025-11-06 |
| kimi-k2.5 | Moonshot Kimi K2.5 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字、图片、视频 | 原生联网搜索 | 2026-01-27 |
| kimi-k2.6 | Moonshot Kimi K2.6 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：thinking.type=disabled | 文字、图片、视频 | 原生联网搜索 | 2026-04-21 |
| kimi-k3 | Kimi K3 | active | 是 | low / high / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-07-16 |
| kimi/kimi-k2.5 | kimi/kimi-k2.5 | active | 是 | 开关：enable_thinking（兼容 API） | 是 | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-01-27 |
| moonshot-kimi-k2-instruct | Moonshot Kimi K2 Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01-01 |
| qvq-max | QVQ Max | active | 是 | 强制思考（无公开关闭参数） | 不支持公开关闭参数 | 文字、图片 | 原生联网搜索 | 2025-03-25 |
| qwen-deep-research | Qwen Deep Research | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-01 |
| qwen-doc-turbo | Qwen Doc Turbo | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-01 |
| qwen-flash | Qwen Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-07-28 |
| qwen-long | Qwen Long | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01-25 |
| qwen-math-plus | Qwen Math Plus | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09-19 |
| qwen-math-turbo | Qwen Math Turbo | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09-19 |
| qwen-max | Qwen Max | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01-25 |
| qwen-mt-plus | Qwen-MT Plus | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01 |
| qwen-mt-turbo | Qwen-MT Turbo | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-01 |
| qwen-omni-turbo | Qwen-Omni Turbo | active | 否 | — | — | 文字、图片、音频、视频 | 原生联网搜索 | 2025-03-26 |
| qwen-omni-turbo-realtime | Qwen-Omni Turbo Realtime | active | 否 | — | — | 文字、图片、音频 | 原生联网搜索 | 2025-05-08 |
| qwen-plus | Qwen Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-09-11 |
| qwen-plus-character | Qwen Plus Character | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-01 |
| qwen-turbo | Qwen Turbo | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-07-15 |
| qwen-vl-max | Qwen-VL Max | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2025-08-13 |
| qwen-vl-ocr | Qwen-VL OCR | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2026-09-11 |
| qwen-vl-plus | Qwen-VL Plus | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2025-08-15 |
| qwen2-5-14b-instruct | Qwen2.5 14B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-32b-instruct | Qwen2.5 32B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-72b-instruct | Qwen2.5 72B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-7b-instruct | Qwen2.5 7B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-coder-32b-instruct | Qwen2.5-Coder 32B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-11 |
| qwen2-5-coder-7b-instruct | Qwen2.5-Coder 7B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-11 |
| qwen2-5-math-72b-instruct | Qwen2.5-Math 72B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-math-7b-instruct | Qwen2.5-Math 7B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-09 |
| qwen2-5-omni-7b | Qwen2.5-Omni 7B | active | 否 | — | — | 文字、图片、音频、视频 | 原生联网搜索 | 2024-12 |
| qwen2-5-vl-72b-instruct | Qwen2.5-VL 72B Instruct | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2024-09 |
| qwen2-5-vl-7b-instruct | Qwen2.5-VL 7B Instruct | active | 否 | — | — | 文字、图片 | 原生联网搜索 | 2024-09 |
| qwen3-14b | Qwen3 14B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-235b-a22b | Qwen3 235B-A22B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-32b | Qwen3 32B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-8b | Qwen3 8B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-coder-30b-a3b-instruct | Qwen3-Coder 30B-A3B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-coder-480b-a35b-instruct | Qwen3-Coder 480B-A35B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-04 |
| qwen3-coder-flash | Qwen3 Coder Flash | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-07-28 |
| qwen3-coder-plus | Qwen3 Coder Plus | active | 否 | — | — | 文字 | 原生联网搜索 | 2026-09-11 |
| qwen3-max | Qwen3 Max | active | 是 | 开关：enable_thinking=true/false | 是 | 文字 | 结构化输出、原生联网搜索 | 2026-09-22 |
| qwen3-next-80b-a3b-instruct | Qwen3-Next 80B-A3B Instruct | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-09 |
| qwen3-next-80b-a3b-thinking | Qwen3-Next 80B-A3B (Thinking) | active | 是 | 强制思考（thinking_budget 可调上限） | 否 | 文字 | 原生联网搜索 | 2025-09 |
| qwen3-omni-flash | Qwen3-Omni Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、音频、视频 | 原生联网搜索 | 2025-09-15 |
| qwen3-omni-flash-realtime | Qwen3-Omni Flash Realtime | active | 否 | — | — | 文字、图片、音频 | 原生联网搜索 | 2025-09-15 |
| qwen3-vl-plus | Qwen3-VL Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片 | 原生联网搜索 | 2025-09-23 |
| qwen3.5-397b-a17b | Qwen3.5 397B-A17B | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-02-16 |
| qwen3.5-flash | Qwen3.5 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-09-22 |
| qwen3.5-plus | Qwen3.5 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-09-22 |
| qwen3.6-flash | Qwen3.6 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-27 |
| qwen3.6-max-preview | Qwen3.6 Max Preview | active | 是 | 开关+预算：enable_thinking；thinking_budget | 是 | 文字 | 结构化输出、原生联网搜索 | 2026-04-21 |
| qwen3.6-plus | Qwen3.6 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-04-02 |
| qwen3.7-flash | Qwen3.7 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-07-15 |
| qwen3.7-max | Qwen3.7 Max | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 原生联网搜索 | 2026-05-21 |
| qwen3.7-plus | Qwen3.7 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-06-04 |
| qwen3.8-flash | Qwen3.8 Flash | active | 是 | low / medium / xhigh | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-08-26 |
| qwen3.8-max | Qwen3.8 Max | active | 是 | low / medium / xhigh | — | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-08-03 |
| qwen3.8-omni-flash | Qwen3.8 Omni Flash | active | 是 | none / low / medium / xhigh | — | 文字、图片、音频、视频 | 结构化输出、原生联网搜索 | 2026-09-17 |
| qwq-32b | QwQ 32B | active | 是 | 强制思考（无关闭档位） | 未公布关闭方式 | 文字 | 原生联网搜索 | 2024-12 |
| qwq-plus | QwQ Plus | active | 是 | 强制思考（无公开关闭参数） | 不可以（仅思考） | 文字 | 原生联网搜索 | 2025-03-05 |
| siliconflow/deepseek-r1-0528 | siliconflow/deepseek-r1-0528 | active | 是 | 强制思考（无公开档位） | 否 | 文字 | 结构化输出、原生联网搜索 | 2025-11-25 |
| siliconflow/deepseek-v3-0324 | siliconflow/deepseek-v3-0324 | active | 否 | — | — | 文字 | 结构化输出、原生联网搜索 | 2025-11-25 |
| siliconflow/deepseek-v3.1-terminus | siliconflow/deepseek-v3.1-terminus | active | 是 | 开关：enable_thinking=true/false | 是 | 文字 | 结构化输出、原生联网搜索 | 2025-11-25 |
| siliconflow/deepseek-v3.2 | siliconflow/deepseek-v3.2 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字 | 结构化输出、原生联网搜索 | 2025-12-03 |
| tongyi-intent-detect-v3 | Tongyi Intent Detect V3 | active | 否 | — | — | 文字 | 原生联网搜索 | 2024-01 |

### 阿里云百炼 Token Plan（国际站）（alibaba-token-plan，20 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M2.5 | MiniMax-M2.5 | active | 是 | 强制思考（无公开档位） | 不可以（仅思考） | 文字 | 原生联网搜索 | 2026-02-12 |
| deepseek-v3.2 | DeepSeek V3.2 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字 | 结构化输出、原生联网搜索 | 2025-12-05 |
| deepseek-v4-flash | DeepSeek V4 Flash | active | 是 | high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-04-24 |
| deepseek-v4-flash-0731 | DeepSeek V4 Flash 0731 | active | 是 | minimal / low / medium / high | — | 文字 | 结构化输出、原生联网搜索 | 2026-07-31 |
| deepseek-v4-pro | DeepSeek V4 Pro | active | 是 | high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-04-24 |
| deepseek-v4-pro-0813 | DeepSeek V4 Pro | active | 是 | low / high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-08-22 |
| deepseek-v4.1-flash | DeepSeek V4 Flash | active | 是 | low / high / max | — | 文字、图片 | 原生联网搜索 | 2026-09-10 |
| glm-5 | GLM-5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-02-11 |
| glm-5.1 | GLM-5.1 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-03-27 |
| glm-5.2 | GLM-5.2 | active | 是 | high / max | 可以（传 none/minimal 即关） | 文字 | 结构化输出、原生联网搜索 | 2026-06-13 |
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |
| kimi-k2.5 | Kimi K2.5 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-01 |
| kimi-k2.6 | Kimi K2.6 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：thinking.type=disabled | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-21 |
| kimi-k2.7-code | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-12 |
| qwen3.6-flash | Qwen3.6 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-27 |
| qwen3.6-plus | Qwen3.6 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-02 |
| qwen3.7-max | Qwen3.7 Max | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 结构化输出、原生联网搜索 | 2026-05-21 |
| qwen3.7-plus | Qwen3.7 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-04 |
| qwen3.8-flash | Qwen3.8 Flash | active | 是 | low / medium / xhigh | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-08-26 |
| qwen3.8-max | Qwen3.8 Max | active | 是 | low / medium / xhigh | — | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-08-03 |

### 阿里云百炼 Token Plan（中国站）（alibaba-token-plan-cn，20 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M2.5 | MiniMax-M2.5 | active | 是 | 强制思考（无公开档位） | 不可以（仅思考） | 文字 | 原生联网搜索 | 2026-02-12 |
| deepseek-v3.2 | DeepSeek V3.2 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字 | 结构化输出、原生联网搜索 | 2025-12-05 |
| deepseek-v4-flash | DeepSeek V4 Flash | active | 是 | high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-04-24 |
| deepseek-v4-flash-0731 | DeepSeek V4 Flash 0731 | active | 是 | minimal / low / medium / high | — | 文字 | 结构化输出、原生联网搜索 | 2026-07-31 |
| deepseek-v4-pro | DeepSeek V4 Pro | active | 是 | high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-04-24 |
| deepseek-v4-pro-0813 | DeepSeek V4 Pro | active | 是 | low / high / max | — | 文字 | 结构化输出、原生联网搜索 | 2026-08-22 |
| deepseek-v4.1-flash | DeepSeek V4 Flash | active | 是 | low / high / max | — | 文字、图片 | 结构化输出、原生联网搜索 | 2026-09-10 |
| glm-5 | GLM-5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-02-11 |
| glm-5.1 | GLM-5.1 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 结构化输出、原生联网搜索 | 2026-03-27 |
| glm-5.2 | GLM-5.2 | active | 是 | high / max | 可以（传 none/minimal 即关） | 文字 | 结构化输出、原生联网搜索 | 2026-06-13 |
| glm-5.3 | GLM-5.3 | active | 是 | low / high / max | 不可关（仅能开启） | 文字 | 结构化输出、原生联网搜索 | 2026-08-14 |
| kimi-k2.5 | Kimi K2.5 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-01 |
| kimi-k2.6 | Kimi K2.6 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：thinking.type=disabled | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-21 |
| kimi-k2.7-code | Kimi K2.7 Code | active | 是 | 强制思考（无公开档位） | 不可以（按托管文档） | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-12 |
| qwen3.6-flash | Qwen3.6 Flash | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-27 |
| qwen3.6-plus | Qwen3.6 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-04-02 |
| qwen3.7-max | Qwen3.7 Max | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字 | 结构化输出、原生联网搜索 | 2026-05-21 |
| qwen3.7-plus | Qwen3.7 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-06-04 |
| qwen3.8-flash | Qwen3.8 Flash | active | 是 | low / medium / xhigh | — | 文字、图片、视频 | 结构化输出、原生联网搜索 | 2026-08-26 |
| qwen3.8-max | Qwen3.8 Max | active | 是 | low / medium / xhigh | — | 文字、图片、PDF文档、视频 | 结构化输出、原生联网搜索 | 2026-08-03 |

### 阿里云百炼 Coding Plan（国际站）（alibaba-coding-plan，10 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M2.5 | MiniMax-M2.5 | active | 是 | 强制思考（无公开档位） | 不可以（仅思考） | 文字 | 原生联网搜索 | 2026-02-12 |
| glm-4.7 | GLM-4.7 | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2025-12-22 |
| glm-5 | GLM-5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2026-02-11 |
| kimi-k2.5 | Kimi K2.5 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字、图片、视频 | 原生联网搜索 | 2026-01-27 |
| qwen3-coder-next | Qwen3 Coder Next | active | 否 | — | — | 文字 | 结构化输出、原生联网搜索 | 2026-02-03 |
| qwen3-coder-plus | Qwen3 Coder Plus | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-07-23 |
| qwen3-max-2026-01-23 | Qwen3 Max | active | 否 | — | — | 文字 | 原生联网搜索 | 2026-01-23 |
| qwen3.5-plus | Qwen3.5 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-02-16 |
| qwen3.6-plus | Qwen3.6 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-04-02 |
| qwen3.7-plus | Qwen3.7 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-06-04 |

### 阿里云百炼 Coding Plan（中国站）（alibaba-coding-plan-cn，10 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M2.5 | MiniMax-M2.5 | active | 是 | 强制思考（无公开档位） | 不可以（仅思考） | 文字 | 原生联网搜索 | 2026-02-12 |
| glm-4.7 | GLM-4.7 | active | 是 | 强制思考（无档位） | 不可关 | 文字 | 原生联网搜索 | 2025-12-22 |
| glm-5 | GLM-5 | active | 是 | 开关：thinking.type=enabled/disabled（开启后模型自动判断） | 可以：thinking.type=disabled | 文字 | 原生联网搜索 | 2026-02-11 |
| kimi-k2.5 | Kimi K2.5 | active | 是 | 开关：enable_thinking=true/false | 是 | 文字、图片 | 原生联网搜索 | 2026-01-27 |
| qwen3-coder-next | Qwen3 Coder Next | active | 否 | — | — | 文字 | 结构化输出、原生联网搜索 | 2026-02-03 |
| qwen3-coder-plus | Qwen3 Coder Plus | active | 否 | — | — | 文字 | 原生联网搜索 | 2025-07-23 |
| qwen3-max-2026-01-23 | Qwen3 Max | active | 否 | — | — | 文字 | 原生联网搜索 | 2026-01-23 |
| qwen3.5-plus | Qwen3.5 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片 | 原生联网搜索 | 2026-02-16 |
| qwen3.6-plus | Qwen3.6 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-04-02 |
| qwen3.7-plus | Qwen3.7 Plus | active | 是 | 开关+预算：enable_thinking；thinking_budget | 可以：`enable_thinking=false` | 文字、图片、视频 | 原生联网搜索 | 2026-06-04 |

## 小米 MiMo（xiaomi）

### 小米 MiMo（xiaomi，5 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| mimo-v2.5 | MiMo-V2.5 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.5-pro | MiMo-V2.5-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.6-flash | MiMo-V2.6-Flash | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |
| mimo-v2.6-pro | MiMo-V2.6-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |
| mimo-v2.6-pro-ultraspeed | MiMo-V2.6-Pro-UltraSpeed | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-21 |

### 小米 MiMo Token Plan（中国集群）（xiaomi-token-plan-cn，4 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| mimo-v2.5 | MiMo-V2.5 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.5-pro | MiMo-V2.5-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.6-flash | MiMo-V2.6-Flash | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |
| mimo-v2.6-pro | MiMo-V2.6-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |

### 小米 MiMo Token Plan（新加坡集群）（xiaomi-token-plan-sgp，4 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| mimo-v2.5 | MiMo-V2.5 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.5-pro | MiMo-V2.5-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.6-flash | MiMo-V2.6-Flash | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |
| mimo-v2.6-pro | MiMo-V2.6-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |

### 小米 MiMo Token Plan（欧洲集群）（xiaomi-token-plan-ams，4 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| mimo-v2.5 | MiMo-V2.5 | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.5-pro | MiMo-V2.5-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字 | 原生联网搜索 | 2026-06-24 |
| mimo-v2.6-flash | MiMo-V2.6-Flash | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |
| mimo-v2.6-pro | MiMo-V2.6-Pro | active | 是 | 开关：thinking.type=enabled/disabled | 可以：`thinking.type=disabled` | 文字、图片、音频、视频 | 原生联网搜索 | 2026-09-22 |

## MiniMax（minimax）

### MiniMax 国际站（minimax，1 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M3 | MiniMax-M3 | active | 是 | 开关：thinking.type=adaptive/disabled | 是 | 文字、图片、视频 | 原生联网搜索 | 2026-06-25 |

### MiniMax 中国站（minimax-cn，1 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M3 | MiniMax-M3 | active | 是 | 开关：thinking.type=adaptive/disabled | 是 | 文字、图片、视频 | 原生联网搜索 | 2026-06-25 |

### MiniMax M Plan（国际站）（minimax-coding-plan，2 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M3 | MiniMax-M3 | active | 是 | 开关：thinking.type=adaptive/disabled | 是 | 文字、图片、视频 | 原生联网搜索 | 2026-06-25 |
| MiniMax-M3.1-Flash-Preview | MiniMax-M3.1-Flash-Preview | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、视频 | 原生联网搜索 | 2026-09-27 |

### MiniMax M Plan（中国站）（minimax-cn-coding-plan，2 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| MiniMax-M3 | MiniMax-M3 | active | 是 | 开关：thinking.type=adaptive/disabled | 是 | 文字、图片、视频 | 原生联网搜索 | 2026-06-25 |
| MiniMax-M3.1-Flash-Preview | MiniMax-M3.1-Flash-Preview | active | 是 | low / medium / high / xhigh / max | — | 文字、图片、视频 | 原生联网搜索 | 2026-09-27 |

## Google Gemini（google）

### Google Gemini（google，20 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| deep-research-max-preview-04-2026 | Deep Research Max Preview (Apr-21-2026) | active | 是 | 专用 Agent：不提供常规思考档位 | 不适用 | 文字、图片、PDF文档、音频、视频 | 原生联网搜索 | 2026-04-21 |
| deep-research-preview-04-2026 | Deep Research Preview (Apr-21-2026) | active | 是 | 专用 Agent：不提供常规思考档位 | 不适用 | 文字、图片、PDF文档、音频、视频 | 原生联网搜索 | 2026-04-21 |
| gemini-2.5-flash | Gemini 2.5 Flash | active | 是 | 预算：thinkingBudget=0..24576；-1 动态 | 是，设 0 | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2025-06-17 |
| gemini-2.5-flash-lite | Gemini 2.5 Flash-Lite | active | 是 | 预算：thinkingBudget=0 或 512..24576；-1 动态 | 是，设 0 | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2025-06-17 |
| gemini-2.5-pro | Gemini 2.5 Pro | active | 是 | 预算：thinkingBudget=128..32768；-1 动态 | 否 | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2025-06-17 |
| gemini-3-flash-preview | Gemini 3 Flash Preview | active | 是 | minimal / low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2025-12-17 |
| gemini-3.1-flash-lite | Gemini 3.1 Flash Lite | active | 是 | minimal / low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-05-07 |
| gemini-3.1-flash-lite-image | Nano Banana 2 Lite | active | 是 | minimal / high | — | 文字、图片 | 原生联网搜索 | 2026-06-30 |
| gemini-3.1-flash-live-preview | Gemini 3.1 Flash Live Preview | active | 是 | minimal / low / medium / high | — | 文字、图片、音频、视频 | 原生联网搜索 | 2026-03-26 |
| gemini-3.1-pro-preview | Gemini 3.1 Pro Preview | active | 是 | low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-02-19 |
| gemini-3.1-pro-preview-customtools | Gemini 3.1 Pro Preview Custom Tools | active | 是 | low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-02-19 |
| gemini-3.5-flash | Gemini 3.5 Flash | active | 是 | minimal / low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-05-19 |
| gemini-3.5-flash-lite | Gemini 3.5 Flash Lite | active | 是 | minimal / low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-07-21 |
| gemini-3.6-flash | Gemini 3.6 Flash | active | 是 | minimal / low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-07-21 |
| gemini-3.7-flash | Gemini 3.7 Flash | active | 是 | low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-08-13 |
| gemini-3.8-flash | Gemini 3.8 Flash | active | 是 | low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-09-02 |
| gemini-flash-latest | Gemini Flash Latest | active | 是 | low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-08-13 |
| gemini-flash-lite-latest | Gemini Flash-Lite Latest | active | 是 | minimal / low / medium / high | — | 文字、图片、PDF文档、音频、视频 | 结构化输出、原生联网搜索 | 2026-07-21 |
| gemma-4-26b-a4b-it | Gemma 4 26B A4B IT | active | 是 | 开关：enable_thinking（Gemma 模板） | 是（关闭模板思考） | 文字、图片 | 结构化输出、原生联网搜索 | 2026-04-02 |
| gemma-4-31b-it | Gemma 4 31B IT | active | 是 | 开关：enable_thinking（Gemma 模板） | 是（关闭模板思考） | 文字、图片 | 结构化输出、原生联网搜索 | 2026-04-02 |

## xAI Grok（xai）

### xAI（xai，4 个）

| 模型编号 | 名称 | 生命周期 | 推理 | 推理参数 | 关闭思考 | 多模态能力 | 原生能力 | 更新时间 |
|---|---|---|---|---|---|---|---|---|
| grok-4.3 | Grok 4.3 | active | 是 | none / low / medium / high | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-04-17 |
| grok-4.5 | Grok 4.5 | active | 是 | low / medium / high | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-07-08 |
| grok-4.6 | Grok 4.6 | active | 是 | low / medium / high / xhigh | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-08-12 |
| grok-4.7 | Grok 4.7 | active | 是 | low / medium / high / xhigh | — | 文字、图片、PDF文档 | 结构化输出、原生联网搜索 | 2026-09-21 |

---

合计 393 条语言模型（按渠道计）。

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

## 许可

本包自身以 MIT 发布，见 [LICENSE](./LICENSE)。

数据来自 [models.dev](https://models.dev)，同样以 MIT 分发（Copyright (c) 2025 models.dev）。
快照在构建期抓取并编译进产物，发布出去的包运行时不联网、不依赖 models.dev 的在线服务。
