import { BASE, type ProviderRule } from './registry.ts';

/** DeepSeek。并行工具始终开启，官方未提到 none，因此该项留 unknown。 */
export const RULES: ProviderRule[] = [
  {
    providerId: 'deepseek',
    patch: {
      ...BASE,
      tools: {
        parallel: 'supported',
        streaming: 'supported',
        choice: { auto: 'supported', required: 'supported', specific: 'supported' },
      },
      promptCaching: 'supported',
    },
    confidence: 'verified',
    source: 'DeepSeek 官方文档：parallel_tool_calls「忽略（并行工具调用始终开启）」；tool_choice 支持 auto/required/指定函数；Responses API 提供 response.function_call_arguments.delta；结构化输出 text.format 完整支持',
  },
];
