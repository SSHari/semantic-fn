export type CaptureError = (line: number, message: string, value: string) => void;

type ErrorInfo = { line: number; message: string; value: string };

export function createErrorTracker() {
  const compileErrors: ErrorInfo[] = [];
  const runTimeErrors: ErrorInfo[] = [];

  function captureError(errors: ErrorInfo[], line: number, message: string, value: string) {
    errors.push({ line, message, value });
    // errors.push(new Error(`Error: ${message}\n${line} | ${value}`));
  }

  const captureCompileError: CaptureError = (...args) => captureError(compileErrors, ...args);
  const captureRunTimeError: CaptureError = (...args) => captureError(runTimeErrors, ...args);

  return {
    compileErrors,
    runTimeErrors,
    captureCompileError,
    captureRunTimeError,
  };
}
