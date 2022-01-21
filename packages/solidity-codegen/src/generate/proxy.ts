import {
  AST,
  blockComment,
  contractDeclaration,
  declarationStatement,
  functionCallExpression,
  functionDeclaration,
  identifierExpression,
  ifStatement,
  literalExpression,
  parseVariableDeclaration,
  returnStatement,
  variableDeclaration,
} from 'solidity-language';

export function generateProxyContracts(): AST.ContractDeclaration[] {
  return [
    contractDeclaration({
      name: 'OwnableDelegateProxy',
    }),
    contractDeclaration({
      name: 'ProxyRegistry',
      body: [
        variableDeclaration({
          name: 'proxies',
          modifiers: ['public'],
          typeAnnotation: 'mapping(address => OwnableDelegateProxy)',
        }),
      ],
    }),
  ];
}

export function generateProxyApprovalFunction({
  usesDelegatedContract,
}: {
  usesDelegatedContract: boolean;
}) {
  return [
    blockComment({ value: 'PROXY REGISTRY', commentType: '/*' }),
    parseVariableDeclaration('address private immutable proxyRegistryAddress'),
    functionDeclaration({
      name: 'isApprovedForAll',
      arguments: ['address owner', 'address operator'],
      modifiers: [
        ...(usesDelegatedContract ? [] : ['override']),
        'public',
        'view',
      ],
      returns: {
        typeAnnotation: 'bool',
        modifiers: [],
      },
      body: [
        declarationStatement({
          declaration: variableDeclaration({
            name: 'proxyRegistry',
            typeAnnotation: 'ProxyRegistry',
            initializer: functionCallExpression({
              callee: identifierExpression('ProxyRegistry'),
              arguments: [identifierExpression('proxyRegistryAddress')],
            }),
          }),
        }),
        ifStatement({
          condition: identifierExpression(
            'address(proxyRegistry.proxies(owner)) == operator',
          ),
          body: [returnStatement(literalExpression('true'))],
        }),
        returnStatement(
          functionCallExpression({
            callee: usesDelegatedContract
              ? identifierExpression('_isApprovedForAll')
              : identifierExpression('super.isApprovedForAll'),
            arguments: [
              identifierExpression('owner'),
              identifierExpression('operator'),
            ],
          }),
        ),
      ],
    }),
  ];
}
