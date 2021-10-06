import { Token } from './tokens';

export type CaptureError = (line: number, message: string, value: string) => void;
export type CaptureRuntimeError = (token: Token, message: string) => void;

type ErrorInfo = { line: number; message: string; value: string };
type RuntimeErrorInfo = { token: Token; message: string };

export function createErrorTracker() {
  const compileErrors: ErrorInfo[] = [];
  const runtimeErrors: RuntimeErrorInfo[] = [];

  const captureCompileError: CaptureError = (line, message, value) => compileErrors.push({ line, message, value });
  const captureRuntimeError: CaptureRuntimeError = (token, message) => runtimeErrors.push({ token, message });

  return {
    compileErrors,
    runtimeErrors,
    captureCompileError,
    captureRuntimeError,
  };
}
