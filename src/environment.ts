import { Token } from './tokens';
import { CaptureRuntimeError } from './errors';

export type Environment = {
  assign: (name: Token, value: any) => void;
  define: (name: string, value: any) => void;
  get: (name: Token) => any;
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
    } else if (values.has(name.lexeme)) {
      values.set(name.lexeme, value);
    } else if (enclosing) {
      enclosing.assign(name, value);
    } else {
      captureError(name, `Undefined variable ${name}.`);
    }
  }

  function define(name: string, value: any) {
    values.set(name, value);
  }

  function get(name: Token) {
    if (values.has(name.lexeme)) return values.get(name.lexeme);
    if (enclosing) return enclosing.get(name);
    captureError(name, `Undefined variable ${name.lexeme}."`);
  }

  return { assign, define, get };
}
