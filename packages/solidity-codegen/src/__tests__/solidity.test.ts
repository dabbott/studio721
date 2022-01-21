import * as s from 'solidity-language';

describe('format', () => {
  it('literal', () => {
    const node = s.formatLiteral({
      type: 'numberLiteral',
      value: '123',
    });

    expect(s.print(node)).toMatchSnapshot();
  });

  it('variable declaration', () => {
    const node = s.formatVariableDeclaration({
      type: 'variableDeclaration',
      name: 'foo',
      typeAnnotation: 'uint256',
      modifiers: ['public'],
      initializer: {
        type: 'literal',
        value: { type: 'numberLiteral', value: '123' },
      },
    });

    expect(s.print(node)).toMatchSnapshot();
  });

  it('contract', () => {
    const node = s.formatContract({
      type: 'contractDeclaration',
      name: 'TestToken',
      extends: ['ERC721', 'ReentrancyGuard', 'Ownable'],
      body: [
        {
          type: 'variableDeclaration',
          name: 'foo',
          typeAnnotation: 'uint256',
          modifiers: ['public'],
          initializer: {
            type: 'literal',
            value: { type: 'numberLiteral', value: '123' },
          },
        },
        {
          type: 'variableDeclaration',
          name: 'bar',
          typeAnnotation: 'uint256',
          modifiers: ['public'],
          initializer: {
            type: 'literal',
            value: { type: 'numberLiteral', value: '123' },
          },
        },
      ],
    });

    expect(s.print(node)).toMatchSnapshot();
  });

  it('import', () => {
    const node = s.formatImport({
      path: '@abc',
      names: [],
    });

    expect(s.print(node)).toMatchSnapshot();
  });

  it('pragma', () => {
    const node = s.formatPragma({
      value: 'solidity ^0.8.9',
    });

    expect(s.print(node)).toMatchSnapshot();
  });

  it('program', () => {
    const node = s.formatProgram({
      license: 'MIT',
      pragma: { value: 'solidity ^0.8.9' },
      imports: [
        { path: '@a', names: [] },
        { path: '@b', names: [] },
        { path: '@c', names: [] },
      ],
      body: [],
    });

    expect(s.print(node)).toMatchSnapshot();
  });
});
