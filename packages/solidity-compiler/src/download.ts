import fetch from 'cross-fetch';
import { SolidityCompilerModule } from './types';

type IWorker = {
  importScripts: (...urls: string[]) => void;
};

function isWebWorker(value: any): value is IWorker {
  return typeof value.importScripts === 'function';
}

const URL = 'https://www.721.so/solc/soljson-v0.8.9+commit.e5eed63a.js';

/**
 * Download and evaluate the compiler script
 *
 * @returns The emscripten-compiled solc API
 */
export async function downloadCompiler(): Promise<SolidityCompilerModule> {
  const self = globalThis;

  if (isWebWorker(self)) {
    self.importScripts(URL);
    return (self as any).Module;
  } else {
    const result = await fetch(URL);
    const text = await result.text();
    // eslint-disable-next-line no-eval
    const solc = eval(text + '\n;Module;');
    return solc;
  }
}
