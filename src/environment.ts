import { Token } from './tokens';
import { CaptureRuntimeError } from './errors';

export type Environment = {
  assign: (name: Token, value: any) => any;
  define: (name: string, value: any) => void;
  get: (name: Token) => { value: any; readonly: boolean };
};

export type EnvironmentOptions = {
  captureError: CaptureRuntimeError;
  enclosing?: Environment;
  initialMap?: Map<string, any>;
  readonly?: boolean;
};

export function buildEnvironment(options: EnvironmentOptions): Environment {
  const { captureError, enclosing, initialMap, readonly = true } = options;
  const values: Map<string, any> = initialMap ?? new Map();

  function assign(name: Token, value: any) {
    if (values.has(name.lexeme) && readonly) {
      captureError(name, `${name} is readonly.`);

      // Return the current value if the field is readonly
      return values.get(name.lexeme);
    } else if (values.has(name.lexeme)) {
      values.set(name.lexeme, value);
      return value;
    } else if (enclosing) {
      return enclosing.assign(name, value);
    }

    captureError(name, `Undefined variable ${name}.`);
  }

  function define(name: string, value: any) {
    values.set(name, value);
  }

  function get(name: Token) {
    if (values.has(name.lexeme)) return { value: values.get(name.lexeme), readonly };
    if (enclosing) return enclosing.get(name);

    captureError(name, `Undefined variable ${name.lexeme}."`);
    return { value: undefined, readonly };
  }

  return { assign, define, get };
}
