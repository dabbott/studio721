import { generateImports } from '../generate/imports';
import { formatProgram, print, program } from 'solidity-language';

describe('imports', () => {
  it('not enumerable', () => {
    const p = program({
      imports: generateImports({
        address: false,
        enumerable: false,
        strings: false,
        royalties: false,
        delegation: false,
        hasAccessToken: false,
      }),
      body: [],
    });

    expect(print(formatProgram(p))).toMatchSnapshot();
  });

  it('enumerable', () => {
    const p = program({
      imports: generateImports({
        address: false,
        enumerable: true,
        strings: false,
        royalties: false,
        delegation: false,
        hasAccessToken: false,
      }),
      body: [],
    });

    expect(print(formatProgram(p))).toMatchSnapshot();
  });

  it('royalties', () => {
    const p = program({
      imports: generateImports({
        address: false,
        enumerable: false,
        strings: false,
        royalties: true,
        delegation: false,
        hasAccessToken: false,
      }),
      body: [],
    });

    expect(print(formatProgram(p))).toMatchSnapshot();
  });

  it('address', () => {
    const p = program({
      imports: generateImports({
        address: true,
        enumerable: false,
        strings: false,
        royalties: false,
        delegation: false,
        hasAccessToken: false,
      }),
      body: [],
    });

    expect(print(formatProgram(p))).toMatchSnapshot();
  });

  it('delegation', () => {
    const p = program({
      imports: generateImports({
        address: false,
        enumerable: false,
        strings: false,
        royalties: false,
        delegation: true,
        hasAccessToken: false,
      }),
      body: [],
    });

    expect(print(formatProgram(p))).toMatchSnapshot();
  });

  it('delegation and access token', () => {
    const p = program({
      imports: generateImports({
        address: false,
        enumerable: false,
        strings: false,
        royalties: false,
        delegation: true,
        hasAccessToken: true,
      }),
      body: [],
    });

    expect(print(formatProgram(p))).toMatchSnapshot();
  });
});
