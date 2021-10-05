import { createFileConfig, createExternalDeps } from 'ssh-dev-scripts/src/rollup.config';
export default createFileConfig({ input: 'src/semantic-fn.ts', external: createExternalDeps({ '@babel/runtime': 'version' }) });
