# AGENT.md

给在本仓库里干活的 AI 代理准备的一份说明。人类读者看 [README.md](./README.md) 就够了。

---

## 这个包在做什么

`@playa0v0/model-catalog` 是一个离线模型能力目录：回答「某个模型，在某个渠道上，到底有哪些能力」。

数据底座是 [models.dev](https://models.dev/api.json) 的公开快照，构建期抓取并按白名单过滤，
运行时零网络、零依赖，只读一份生成好的纯数据模块。第一版只覆盖 11 家厂商。

包本身不做网络请求、不保存密钥。工具执行、文件修改、命令审批都属于 Harness，不在这里。

---

## 目录结构

```
data/
  capability-overrides.ts   # 人工补充层汇总入口，只做汇总，不写规则
  manual-channels.ts        # 上游没有的渠道/模型，手工定义（含实测结论）
  vendors/                  # 每个厂商一个文件，改某家只碰那一个
    registry.ts             # 共享类型 + 渠道↔厂商映射 + 基础补丁 BASE
    <vendor>.ts             # 该厂商的渠道规则与 offering 例外
scripts/
  build-catalog.ts          # 拉上游 → 过滤 → 套补丁 → 生成 src/generated/catalog.ts
  validate.ts               # 构建期兜底校验
src/
  schema.ts                 # 唯一类型来源，枚举写成 as const 常量数组再推导类型
  queries.ts                # 只读查询层
  resolver.ts               # 「模型→渠道→Adapter→用户」四层仲裁
  generated/catalog.ts      # 生成物，勿手工编辑
tests/
  catalog.test.ts           # 只读本地快照，离线可跑
```

---

## 硬性约定（改之前先读）

1. **三态语义**：能力只有 `supported` / `unsupported` / `unknown`。
   **没有依据就写 `unknown`，绝不推测**。`unknown` 与 `unsupported` 不是一回事，
   字段缺失必须落到 `unknown`，不得默认成 `unsupported`——这是本包相对上游的核心增益。

2. **生成物不可手改**：`src/generated/catalog.ts` 由 `scripts/build-catalog.ts` 生成。
   要改内容就改 `data/` 或构建脚本，然后重新构建。

3. **每条人工结论都要能溯源**：写规则时必须带 `confidence` 与 `source`。
   - `verified` —— 有官方文档或实测，来源写清楚
   - `inferred` —— 依据协议形态/公开资料推断，尚未逐条核验

4. **不能跨端点外推**：同一厂商不同入口（如 `/api/plan` 与 `/api/v3`）路径不同时，
   实测结论不通用。不同渠道的结论各自记录，不合并。

5. **不跨协议外推**：`tools.streaming` 这类能力与协议相关，验证时必须用项目实际
   采用的适配器协议测，其它协议的结果只能作为旁证，不能直接搬。

6. **渠道回落到厂商**：构建脚本查不到某 providerId 的规则时，按 `VENDOR_BY_PROVIDER`
   落到同厂商主渠道规则。套餐渠道（`*-coding-plan` / `*-token-plan`）走这条链路；
   但 `data/manual-channels.ts` 里的手工渠道**不参与回落**，只认实测。

---

## 常做的几类改动

- **给已有厂商加/改规则**：只动 `data/vendors/<vendor>.ts`，`source` 写清依据。
- **接入新厂商**：加厂商文件 → 在 `capability-overrides.ts` 汇总 → 必要时补 registry 映射。
- **上游没有的渠道/模型**：写进 `data/manual-channels.ts`，provider / model / offering 一起补，
  能力从「全 unknown 骨架」起步，只填实测覆盖到的字段。
- **改完必做**：重建快照，然后跑校验、类型检查、测试。

---

## 命令

```bash
npm run build:catalog    # 抓 models.dev 快照并生成 src/generated/catalog.ts（走缓存）
npm run refresh:catalog  # 同上，忽略缓存强制重拉
npm run validate         # 校验生成物：引用完整性、唯一性、三态取值、排序确定性
npm run typecheck        # tsc --noEmit，覆盖 src / data / scripts / tests
npm test                 # node --test，离线运行
npm run build            # 输出 dist
```

改动能力数据后，标准验证顺序：`build:catalog` → `validate` → `typecheck` → `test`。

---

## 代码风格

- 注释用中文，直接说清意图与依据，不要「Phase 1」「设计稿 v1」这类术语式注释。
- 偏好少而合并的文件、最小改动、直接方案，别为假想的未来需求做抽象。
- 命名要人类可读，不要机器生成式的无意义标识符。
- 运行时不引入任何第三方依赖；脚本与测试用 Node 原生跑 TypeScript。

---

## 相关技能

维护厂商注册表（新增厂商、追加模型规则、更新快照基准与验证流程）时，
优先按 `vendor-registry-maintenance` 技能里的流程走，不要每次都从头通读代码。
