import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CAPABILITY_PATHS,
  MODEL_KINDS,
  findOfferings,
  listModels,
  listProviders,
  readCapability,
  resolveModel,
  supports,
} from '../src/index.ts';
import type { Capabilities } from '../src/index.ts';

/**
 * 这些测试全部只读本地生成的快照，不联网、不写磁盘，
 * 因此可以在任何环境下直接 `node --test tests/`。
 */

test('缺失的能力路径一律落到 unknown，而不是 unsupported', () => {
  const partial = { streaming: 'supported' } as unknown as Capabilities;
  assert.equal(readCapability(partial, 'tools.streaming'), 'unknown');
  assert.equal(readCapability(partial, 'tools.choice.none'), 'unknown');
  assert.equal(readCapability(partial, 'hostedTools.webSearch'), 'unknown');
});

test('快照非空，且每个模型都带合法的 kind 与全部能力路径', () => {
  assert.ok(listProviders().length > 0);
  const models = listModels();
  assert.ok(models.length > 0);
  for (const model of models) {
    assert.ok(MODEL_KINDS.includes(model.kind), `${model.id} 的 kind 非法`);
    for (const path of CAPABILITY_PATHS) {
      const value = readCapability(model.capabilities, path);
      assert.ok(['supported', 'unsupported', 'unknown'].includes(value));
    }
  }
});

test('官方文档核到的硬事实：xai 不支持流式工具', () => {
  const offerings = findOfferings({ providerId: 'xai' });
  assert.ok(offerings.length > 0);
  for (const offering of offerings) {
    assert.equal(
      supports({ offeringId: offering.id }, 'tools.streaming'),
      'unsupported',
      `${offering.id} 应不支持流式工具`,
    );
  }
});

test('官方文档核到的硬事实：智谱 / 小米 / MiniMax 只支持 auto 工具选择', () => {
  for (const providerId of ['zai', 'zhipuai', 'xiaomi', 'minimax', 'minimax-cn']) {
    const offerings = findOfferings({ providerId });
    assert.ok(offerings.length > 0, `${providerId} 应有 offering`);
    for (const offering of offerings) {
      assert.equal(readCapability(offering.capabilities, 'tools.choice.auto'), 'supported');
      assert.equal(
        readCapability(offering.capabilities, 'tools.choice.required'),
        'unsupported',
        `${offering.id} 的 required 应为 unsupported`,
      );
    }
  }
});

test('官方文档核到的硬事实：MiniMax 提供托管联网搜索', () => {
  for (const providerId of ['minimax', 'minimax-cn']) {
    const offerings = findOfferings({ providerId });
    assert.ok(offerings.length > 0, `${providerId} 应有 offering`);
    for (const offering of offerings) {
      assert.equal(
        readCapability(offering.capabilities, 'hostedTools.webSearch'),
        'supported',
        `${offering.id} 应支持托管联网搜索`,
      );
    }
  }
});

test('官方文档核到的硬事实：DeepSeek 仅 V4 Pro 的 Responses API 支持托管联网搜索', () => {
  const pro = findOfferings({ providerId: 'deepseek' }).find(
    (offering) => offering.apiModelId === 'deepseek-v4-pro',
  );
  assert.ok(pro, '应存在 DeepSeek V4 Pro offering');
  assert.equal(readCapability(pro.capabilities, 'hostedTools.webSearch'), 'supported');

  const flash = findOfferings({ providerId: 'deepseek' }).find(
    (offering) => offering.apiModelId === 'deepseek-flash',
  );
  assert.ok(flash, '应存在 DeepSeek Flash offering');
  assert.equal(readCapability(flash.capabilities, 'hostedTools.webSearch'), 'unsupported');
});

test('采样支持：小米各渠道随模型记为 supported，kimi 与阿里缺字段保持 unknown', () => {
  // 小米主站与 Token Plan 三集群共享同一批 MiMo 模型，采样随模型；
  // 上游对 tts 等条目缺 temperature 字段，按模型口径记为支持，不留 unknown
  for (const providerId of [
    'xiaomi',
    'xiaomi-token-plan-cn',
    'xiaomi-token-plan-sgp',
    'xiaomi-token-plan-ams',
  ]) {
    const offerings = findOfferings({ providerId });
    assert.ok(offerings.length > 0, `${providerId} 应有 offering`);
    for (const offering of offerings) {
      assert.equal(
        readCapability(offering.capabilities, 'sampling.temperature'),
        'supported',
        `${offering.id} 的采样应随模型记为 supported`,
      );
    }
  }

  // 火山 Agent Plan（手工渠道）：采样同样随模型，取目录里对应模型的值
  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    const model = listModels().find((m) => m.id === offering.modelId);
    assert.ok(model, `${offering.id} 应能对应到目录模型`);
    assert.equal(
      readCapability(offering.capabilities, 'sampling.temperature'),
      readCapability(model.capabilities, 'sampling.temperature'),
      `${offering.id} 的采样应随模型`,
    );
  }

  // kimi Code Plan 与阿里各渠道：上游缺 temperature 的条目直接记为 unknown
  const missing: Array<[string, string]> = [
    ['kimi-code-plan-cn', 'kimi-for-coding'],
    ['kimi-code-plan-global', 'kimi-for-coding'],
    ['alibaba', 'qwen3.8-flash'],
    ['alibaba-cn', 'qwen3.8-omni-flash'],
    ['alibaba-token-plan', 'qwen3.8-flash'],
  ];
  for (const [providerId, apiModelId] of missing) {
    const offering = findOfferings({ providerId }).find((o) => o.apiModelId === apiModelId);
    assert.ok(offering, `${providerId} 应提供 ${apiModelId}`);
    assert.equal(
      readCapability(offering.capabilities, 'sampling.temperature'),
      'unknown',
      `${providerId}/${apiModelId} 的采样应为 unknown`,
    );
  }
});

test('官方文档核到的硬事实：小米联网搜索按模型区分', () => {
  const offerings = findOfferings({ providerId: 'xiaomi' });
  for (const offering of offerings) {
    const expected = /^mimo-v2\.[56]/.test(offering.apiModelId) ? 'supported' : 'unknown';
    assert.equal(
      readCapability(offering.capabilities, 'hostedTools.webSearch'),
      expected,
      `${offering.apiModelId} 的联网搜索状态应为 ${expected}`,
    );
  }
});

test('实测确认：小米与 MiniMax 的流式工具为分片返回', () => {
  for (const providerId of ['xiaomi', 'minimax', 'minimax-cn']) {
    for (const offering of findOfferings({ providerId })) {
      assert.equal(
        readCapability(offering.capabilities, 'tools.streaming'),
        'supported',
        `${offering.id} 的流式工具应为 supported`,
      );
    }
  }
});

test('聚合平台按 lab 区分：豆包的结论不外溢到火山上的第三方模型', () => {
  const offerings = findOfferings({ providerId: 'volcengine' });
  assert.ok(offerings.length > 0);
  for (const offering of offerings) {
    const expected = offering.apiModelId.startsWith('doubao-') ? 'supported' : 'unknown';
    assert.equal(
      readCapability(offering.capabilities, 'tools.streaming'),
      expected,
      `${offering.id} 的流式工具状态不对`,
    );
  }
});

test('套餐渠道已纳入，且与同厂商主渠道共享能力结论', () => {
  const pairs: Array<[string, string]> = [
    ['volcengine-coding-plan', 'volcengine'],
    ['alibaba-coding-plan-cn', 'alibaba-cn'],
    ['alibaba-token-plan', 'alibaba'],
    ['xiaomi-token-plan-cn', 'xiaomi'],
    ['minimax-coding-plan', 'minimax'],
    ['zai-coding-plan', 'zai'],
    ['kimi-code-plan-cn', 'moonshotai-cn'],
  ];

  for (const [planId, mainId] of pairs) {
    const plan = findOfferings({ providerId: planId });
    assert.ok(plan.length > 0, `${planId} 应至少有一条 offering`);

    const vendorOf = (id: string) => listProviders().find((p) => p.id === id)?.vendor;
    assert.equal(vendorOf(planId), vendorOf(mainId), `${planId} 应与 ${mainId} 同属一个厂商`);
  }
});

test('Adapter 明确未实现时一票否决', () => {
  const offeringId = findOfferings({ providerId: 'openai' })[0]!.id;
  const resolved = resolveModel({
    offeringId,
    adapter: { 'tools.calling': 'unsupported' },
  });
  assert.equal(resolved.capabilities['tools.calling'].status, 'unsupported');
  assert.match(resolved.capabilities['tools.calling'].reason, /Adapter/);
});

test('Adapter 未声明实现时，渠道说支持也降到 unknown', () => {
  const offeringId = findOfferings({ providerId: 'openai' })[0]!.id;
  const resolved = resolveModel({
    offeringId,
    adapter: { streaming: 'unknown' },
  });
  assert.equal(resolved.capabilities['streaming'].status, 'unknown');
});

test('用户层只能收紧，不能放开厂商硬限制', () => {
  const offeringId = findOfferings({ providerId: 'xai' })[0]!.id;
  const resolved = resolveModel({
    offeringId,
    userDisabled: ['streaming'],
  });
  assert.equal(resolved.capabilities['streaming'].status, 'unsupported');
  assert.match(resolved.capabilities['streaming'].reason, /用户/);
});

test('resolveModel 保留逐层结论，方便 UI 解释判断来源', () => {
  const offeringId = findOfferings({ providerId: 'openai' })[0]!.id;
  const resolved = resolveModel({ offeringId, adapter: { 'tools.calling': 'supported' } });
  const layers = resolved.capabilities['tools.calling'].layers.map((l) => l.layer);
  assert.deepEqual(layers, ['model', 'offering', 'adapter']);
});

test('findOfferings 的 unknownPolicy：默认排除未知，include 放行', () => {
  const required = ['hostedTools.codeExecution'] as const;

  const strict = findOfferings({ providerId: 'volcengine', requiredCapabilities: [...required] });
  assert.equal(strict.length, 0, '默认策略下 unknown 不应通过');

  const loose = findOfferings({
    providerId: 'volcengine',
    requiredCapabilities: [...required],
    unknownPolicy: 'include',
  });
  assert.ok(loose.length > 0, 'include 策略下 unknown 应通过');
});

test('findOfferings 只放行明确 supported 的能力', () => {
  const matched = findOfferings({ providerId: 'openai', requiredCapabilities: ['tools.calling'] });
  assert.ok(matched.length > 0);
  for (const offering of matched) {
    assert.equal(readCapability(offering.capabilities, 'tools.calling'), 'supported');
  }
});

// ---------------------------------------------------------------------------
// 火山方舟 Agent Plan（手工渠道）：结论全部来自实测，不与按量付费渠道回落
// ---------------------------------------------------------------------------

function planOffering(apiModelId: string) {
  const found = findOfferings({ providerId: 'volcengine-agent-plan' }).find(
    (o) => o.apiModelId === apiModelId,
  );
  assert.ok(found, `Agent Plan 应提供 ${apiModelId}`);
  return found;
}

test('Agent Plan 是手工渠道，共 13 条 offering，端点走 /api/plan', () => {
  const provider = listProviders().find((p) => p.id === 'volcengine-agent-plan');
  assert.ok(provider, '应收录 volcengine-agent-plan 渠道');
  assert.equal(provider.vendor, 'bytedance');
  assert.match(provider.apiBase ?? '', /\/api\/plan\/v3$/);
  assert.equal(findOfferings({ providerId: 'volcengine-agent-plan' }).length, 13);
});

test('Agent Plan 实测：13 个模型的流式、工具调用与 tool_choice=auto 全部支持', () => {
  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    for (const path of ['streaming', 'tools.calling', 'tools.choice.auto'] as const) {
      assert.equal(readCapability(offering.capabilities, path), 'supported', `${offering.id} 的 ${path}`);
    }
  }
});

test('Agent Plan 实测例外：minimax-m3 不并行、流式工具整段返回', () => {
  const m3 = planOffering('minimax-m3');
  assert.equal(readCapability(m3.capabilities, 'tools.parallel'), 'unsupported');
  assert.equal(readCapability(m3.capabilities, 'tools.streaming'), 'unsupported');

  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    if (offering.apiModelId === 'minimax-m3') continue;
    assert.equal(readCapability(offering.capabilities, 'tools.parallel'), 'supported', offering.id);
    assert.equal(readCapability(offering.capabilities, 'tools.streaming'), 'supported', offering.id);
  }
});

test('Agent Plan 实测例外：三个 Kimi 与 glm-5.3 的指定工具调用', () => {
  for (const id of ['kimi-k3', 'kimi-k2.7-code', 'kimi-k2.8-preview']) {
    assert.equal(readCapability(planOffering(id).capabilities, 'tools.choice.specific'), 'unsupported');
  }
  // glm-5.3 两套协议结论打架，保持 unknown
  assert.equal(readCapability(planOffering('glm-5.3').capabilities, 'tools.choice.specific'), 'unknown');

  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    if (['kimi-k3', 'kimi-k2.7-code', 'kimi-k2.8-preview', 'glm-5.3'].includes(offering.apiModelId)) {
      continue;
    }
    assert.equal(readCapability(offering.capabilities, 'tools.choice.specific'), 'supported', offering.id);
  }
});

test('Agent Plan 实测例外：三个模型传 tool_choice=none 仍会调用工具', () => {
  const unsupported = ['doubao-seed-evolving', 'doubao-seed-2.1-pro', 'glm-5.3-flash'];
  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    const expected = unsupported.includes(offering.apiModelId) ? 'unsupported' : 'supported';
    assert.equal(readCapability(offering.capabilities, 'tools.choice.none'), expected, offering.id);
  }
});

test('Agent Plan 实测例外：kimi-k2.7-code 不支持 required', () => {
  assert.equal(readCapability(planOffering('kimi-k2.7-code').capabilities, 'tools.choice.required'), 'unsupported');
  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    if (offering.apiModelId === 'kimi-k2.7-code') continue;
    assert.equal(readCapability(offering.capabilities, 'tools.choice.required'), 'supported', offering.id);
  }
});

test('Agent Plan 只对实测覆盖的字段下结论，其余保持 unknown', () => {
  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    for (const path of [
      'structuredOutput.jsonMode',
      'structuredOutput.jsonSchema',
      'promptCaching',
      'hostedTools.webSearch',
      'hostedTools.codeExecution',
    ] as const) {
      assert.equal(readCapability(offering.capabilities, path), 'unknown', `${offering.id} 的 ${path}`);
    }
  }
});

test('Agent Plan 的推理形态随模型继承', () => {
  for (const offering of findOfferings({ providerId: 'volcengine-agent-plan' })) {
    const model = listModels().find((m) => m.id === offering.modelId);
    assert.ok(model, `${offering.id} 应能对应到目录模型`);
    assert.equal(
      offering.capabilities.reasoning.supported,
      model.capabilities.reasoning.supported,
      `${offering.id} 的推理支持应随模型`,
    );
    assert.deepEqual(offering.capabilities.reasoning.forms, model.capabilities.reasoning.forms, offering.id);
    assert.equal(
      offering.capabilities.reasoning.canDisable,
      model.capabilities.reasoning.canDisable,
      offering.id,
    );
  }
});

// ---------------------------------------------------------------------------
// 推理控制形态（forms）与关闭思考（canDisable）：按 docs/模型清单.md 人工维护
// ---------------------------------------------------------------------------

test('推理形态：小米全渠道为开关式且可关闭', () => {
  for (const providerId of [
    'xiaomi',
    'xiaomi-token-plan-cn',
    'xiaomi-token-plan-sgp',
    'xiaomi-token-plan-ams',
  ]) {
    for (const offering of findOfferings({ providerId })) {
      if (readCapability(offering.capabilities, 'reasoning.supported') !== 'supported') continue;
      assert.deepEqual(offering.capabilities.reasoning.forms, ['toggle'], offering.id);
      assert.equal(offering.capabilities.reasoning.canDisable, 'yes', offering.id);
    }
  }
});

test('推理形态：glm-5.3 各渠道为档位式且不可关闭', () => {
  let seen = 0;
  for (const providerId of [
    'zai',
    'zhipuai',
    'alibaba',
    'alibaba-cn',
    'volcengine',
    'volcengine-coding-plan',
  ]) {
    for (const offering of findOfferings({ providerId })) {
      if (!/^glm-5[.-]3/.test(offering.apiModelId)) continue;
      assert.deepEqual(offering.capabilities.reasoning.forms, ['effort'], offering.id);
      assert.equal(offering.capabilities.reasoning.canDisable, 'no', offering.id);
      seen++;
    }
  }
  assert.ok(seen >= 5, `glm-5.3 系列应覆盖多个渠道，实际命中 ${seen} 条`);
});

test('推理形态：kimi-k2.7-code 强制思考、无档位且不可关闭', () => {
  let seen = 0;
  for (const providerId of [
    'moonshotai',
    'moonshotai-cn',
    'volcengine-coding-plan',
    'volcengine-agent-plan',
  ]) {
    for (const offering of findOfferings({ providerId })) {
      if (!/k2\.7-code/.test(offering.apiModelId)) continue;
      assert.deepEqual(offering.capabilities.reasoning.forms, [], offering.id);
      assert.equal(offering.capabilities.reasoning.canDisable, 'no', offering.id);
      seen++;
    }
  }
  assert.ok(seen >= 4, `kimi-k2.7-code 应覆盖多个渠道，实际命中 ${seen} 条`);
});

test('推理形态：非推理模型的 forms 为空数组、canDisable 为 unknown', () => {
  for (const offering of findOfferings({ providerId: 'openai' })) {
    if (readCapability(offering.capabilities, 'reasoning.supported') === 'supported') continue;
    assert.deepEqual(offering.capabilities.reasoning.forms, [], offering.id);
    assert.equal(offering.capabilities.reasoning.canDisable, 'unknown', offering.id);
  }
});

test('Agent Plan 的网关模型名映射到目录模型，缺失的 seed-2.1-lite 已补', () => {
  assert.equal(planOffering('doubao-seed-2.1-pro').modelId, 'bytedance-seed/seed-2.1-pro');
  assert.equal(planOffering('deepseek-v4.1-flash').modelId, 'deepseek/deepseek-v4.1-flash');
  assert.equal(planOffering('kimi-k2.7-code').modelId, 'moonshotai/kimi-k2.7-code');
  assert.equal(planOffering('minimax-m3').modelId, 'minimax/MiniMax-M3');

  const lite = listModels().find((m) => m.id === 'bytedance-seed/seed-2.1-lite');
  assert.ok(lite, '上游缺失的 seed-2.1-lite 应被手工补进目录');
  assert.equal(planOffering('doubao-seed-2.1-lite').modelId, 'bytedance-seed/seed-2.1-lite');
});
