import { getCompiler } from '..';
import { createCompilerInput } from '../input';

jest.setTimeout(30000);

const helloWorld = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract HelloWorld {
  string public greet = "Hello World!";
}
`;

it('compiles', async () => {
  const compiler = await getCompiler();

  expect(compiler.version).toEqual('0.8.9+commit.e5eed63a.Emscripten.clang');

  const filename = 'HelloWorld.sol';

  const result = compiler.compile(
    createCompilerInput({
      [filename]: helloWorld,
    }),
  );

  expect(Object.keys(result.contracts)).toEqual([filename]);
  expect(Object.keys(result.contracts[filename])).toEqual(['HelloWorld']);
});
