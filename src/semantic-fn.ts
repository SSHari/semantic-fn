import { scanner } from './scanner';
import { parser } from './parser';
import { walkTree } from './tree-walker';
import { evaluateTree } from './tree-walkers/evaluate-tree';

export type SemanticFnOptions = { argNames?: string[]; defaultReturnValue?: any };

export function buildSemanticFn(descriptor: string, options: SemanticFnOptions = {}) {
  const { argNames = [], defaultReturnValue } = options;
  const argMap = argNames.reduce<Record<string, number>>((map, argName, index) => ({ ...map, [argName]: index }), {});

  const tokens = scanner(descriptor, argMap);
  const syntaxTree = parser(tokens);

  if (syntaxTree) {
    return (...args: any[]) => walkTree(evaluateTree(argMap, ...args), syntaxTree);
  }

  return () => defaultReturnValue;
}
