import { normalizer } from './normalizer';
import { scanner } from './scanner';
import { parser } from './parser';
import { walkTree } from './tree-walker';
import { evaluateTree } from './tree-walkers/evaluate-tree';
import { createErrorTracker } from './errors';

export type SemanticFnOptions = { argNames?: string[]; defaultReturnValue?: any };

export function buildSemanticFn(descriptor: string, options: SemanticFnOptions = {}) {
  const { argNames = [], defaultReturnValue } = options;
  const argMap = argNames.reduce<Record<string, number>>((map, argName, index) => ({ ...map, [argName]: index }), {});

  const errorTracker = createErrorTracker();

  const normalizedDescriptor = normalizer(descriptor);

  const tokens = scanner(normalizedDescriptor, errorTracker.captureCompileError);
  const statements = parser(tokens, errorTracker.captureCompileError);

  if (statements) {
    return (...args: any[]) => walkTree(evaluateTree(argMap, ...args), statements);
  }

  return () => defaultReturnValue;
}
