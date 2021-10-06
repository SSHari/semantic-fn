import { buildEnvironment } from './environment';
import { normalizer } from './normalizer';
import { scanner } from './scanner';
import { parser } from './parser';
import { walkTree } from './tree-walker';
import { evaluateTree } from './tree-walkers/evaluate-tree';
import { createErrorTracker } from './errors';

export type SemanticFnOptions = { argNames?: string[]; defaultReturnValue?: any; scope?: Record<string, any> };

export function buildSemanticFn(descriptor: string, options: SemanticFnOptions = {}) {
  const { argNames = [], defaultReturnValue, scope = {} } = options;

  const errorTracker = createErrorTracker();
  const normalizedDescriptor = normalizer(descriptor);

  const tokens = scanner(normalizedDescriptor, errorTracker.captureCompileError);
  const statements = parser(tokens, errorTracker.captureCompileError);

  if (statements) {
    // Variables that are passed in can't be mutated
    const globalEnvironment = buildEnvironment({
      captureError: errorTracker.captureRuntimeError,
      initialMap: new Map(Object.entries(scope)),
      readonly: true,
    });

    return (...args: any[]) => {
      try {
        // Function args that are passed in can't be mutated
        const argEnvironment = buildEnvironment({
          captureError: errorTracker.captureRuntimeError,
          enclosing: globalEnvironment,
          initialMap: new Map(argNames.map((name, index) => [name, args[index]])),
          readonly: true,
        });

        return walkTree(evaluateTree({ captureError: errorTracker.captureRuntimeError, enclosing: argEnvironment }), statements);
      } catch (error) {
        // TODO: Handle the runtime errors here
      }
    };
  }

  return () => defaultReturnValue;
}
