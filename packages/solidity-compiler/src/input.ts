import { CompilerInput } from 'hardhat/types';

export function createCompilerInput(
  files: Record<string, string>,
): CompilerInput {
  return {
    language: 'Solidity',
    sources: Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, { content }]),
    ),
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
}
