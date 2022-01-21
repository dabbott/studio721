import { downloadCompiler } from './download';
import { SolidityCompiler } from './types';
import { wrapCompilerModule } from './wrap';

export * from './types';
export { createCompilerInput } from './input';

export async function getCompiler(): Promise<SolidityCompiler> {
  const solc = await downloadCompiler();
  return wrapCompilerModule(solc);
}
