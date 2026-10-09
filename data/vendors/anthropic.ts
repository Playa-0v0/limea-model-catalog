import { BASE, type ProviderRule } from './registry.ts';

/** Anthropic。tool_choice 的 any 对应本包的 required（强制本轮必须调工具）。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'anthropic',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', required: 'supported', none: 'supported', specific: 'supported' },
      },
      promptCaching: 'supported',
      hostedTools: { webSearch: 'supported', codeExecution: 'supported' },
    },
    confidence: 'verified',
    source: 'Anthropic 官方 tool use 文档（docs.anthropic.com）：tool_choice 取值出现 auto / none / any / tool 四种；服务端工具为 web_search / code_execution / web_fetch / tool_search；另支持 strict: true 的严格 schema',
  },
];
