import {
  AST,
  blockComment,
  functionDeclaration,
  identifierExpression,
  literalExpression,
  variableDeclaration,
} from 'solidity-language';

export function generateActivation({
  initialValue,
  toggleAccessToken,
  mutableAccessToken,
}: {
  initialValue: boolean;
  toggleAccessToken: boolean;
  mutableAccessToken: boolean;
}): (AST.Declaration | AST.BlockComment)[] {
  return [
    blockComment({ value: 'ACTIVATION', commentType: '/*' }),
    variableDeclaration({
      name: 'saleIsActive',
      typeAnnotation: 'bool',
      modifiers: ['public'],
      initializer: literalExpression(String(initialValue)),
    }),
    functionDeclaration({
      name: 'setSaleIsActive',
      arguments: ['bool saleIsActive_'],
      modifiers: ['external', 'onlyOwner'],
      body: [
        {
          type: 'expressionStatement',
          expression: {
            type: 'assignmentExpression',
            lhs: identifierExpression('saleIsActive'),
            rhs: identifierExpression('saleIsActive_'),
          },
        },
      ],
    }),
    ...(toggleAccessToken
      ? [
          variableDeclaration({
            name: 'accessTokenIsActive',
            typeAnnotation: 'bool',
            modifiers: ['public'],
            initializer: literalExpression(String(true)),
          }),
          functionDeclaration({
            name: 'setAccessTokenIsActive',
            arguments: ['bool accessTokenIsActive_'],
            modifiers: ['external', 'onlyOwner'],
            body: [
              {
                type: 'expressionStatement',
                expression: {
                  type: 'assignmentExpression',
                  lhs: identifierExpression('accessTokenIsActive'),
                  rhs: identifierExpression('accessTokenIsActive_'),
                },
              },
            ],
          }),
        ]
      : []),
    ...(mutableAccessToken
      ? [
          functionDeclaration({
            name: 'setAccessTokenAddress',
            arguments: ['address accessTokenAddress_'],
            modifiers: ['external', 'onlyOwner'],
            body: [
              {
                type: 'expressionStatement',
                expression: {
                  type: 'assignmentExpression',
                  lhs: identifierExpression('accessTokenAddress'),
                  rhs: identifierExpression('accessTokenAddress_'),
                },
              },
            ],
          }),
        ]
      : []),
  ];
}
