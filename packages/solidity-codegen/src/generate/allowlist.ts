import { ContractConfigState } from 'state';
import {
  AST,
  binaryExpression,
  blockComment,
  expressionStatement,
  functionCallExpression,
  functionDeclaration,
  identifierExpression,
  ifStatement,
  parseVariableDeclaration,
  returnStatement,
  variableDeclaration,
} from 'solidity-language';

export function generateAllowlist(
  config: Pick<
    ContractConfigState,
    'limitPerWallet' | 'amountAllowedForOwner' | 'allowlistDestinations'
  >,
): (AST.Declaration | AST.BlockComment)[] {
  const hasAllowlist =
    config.amountAllowedForOwner > 0 || config.allowlistDestinations.length > 0;

  if (!hasAllowlist && config.limitPerWallet === undefined) {
    return [];
  }

  return [
    blockComment({ value: 'MINTING LIMITS', commentType: '/*' }),
    variableDeclaration({
      name: 'mintCountMap',
      modifiers: ['private'],
      typeAnnotation: 'mapping(address => uint256)',
    }),
    variableDeclaration({
      name: 'allowedMintCountMap',
      modifiers: ['private'],
      typeAnnotation: 'mapping(address => uint256)',
    }),
    ...(config.limitPerWallet !== undefined
      ? [
          parseVariableDeclaration(
            `uint256 public constant MINT_LIMIT_PER_WALLET = ${config.limitPerWallet}`,
          ),
        ]
      : []),
    ...(hasAllowlist && config.limitPerWallet !== undefined
      ? [
          functionDeclaration({
            name: 'max',
            arguments: ['uint256 a', 'uint256 b'],
            modifiers: ['private pure'],
            returns: {
              modifiers: [],
              typeAnnotation: 'uint256',
            },
            body: [returnStatement(identifierExpression('a >= b ? a : b'))],
          }),
        ]
      : []),
    functionDeclaration({
      name: 'allowedMintCount',
      arguments: ['address minter'],
      modifiers: ['public', 'view'],
      returns: {
        modifiers: [],
        typeAnnotation: 'uint256',
      },
      body: [
        ...(hasAllowlist && config.limitPerWallet !== undefined
          ? [
              ifStatement({
                condition: identifierExpression('saleIsActive'),
                body: [
                  returnStatement(
                    binaryExpression({
                      lhs: functionCallExpression({
                        callee: identifierExpression('max'),
                        arguments: [
                          identifierExpression('allowedMintCountMap[minter]'),
                          identifierExpression('MINT_LIMIT_PER_WALLET'),
                        ],
                      }),
                      operator: '-',
                      rhs: identifierExpression('mintCountMap[minter]'),
                    }),
                  ),
                ],
              }),
            ]
          : []),
        ...(hasAllowlist
          ? [
              returnStatement(
                binaryExpression({
                  lhs: identifierExpression('allowedMintCountMap[minter]'),
                  operator: '-',
                  rhs: identifierExpression('mintCountMap[minter]'),
                }),
              ),
            ]
          : [
              returnStatement(
                binaryExpression({
                  lhs: identifierExpression('MINT_LIMIT_PER_WALLET'),
                  operator: '-',
                  rhs: identifierExpression('mintCountMap[minter]'),
                }),
              ),
            ]),
      ],
    }),
    functionDeclaration({
      name: 'updateMintCount',
      arguments: ['address minter', 'uint256 count'],
      modifiers: ['private'],
      body: [
        expressionStatement({
          expression: binaryExpression({
            lhs: identifierExpression('mintCountMap[minter]'),
            operator: '+=',
            rhs: identifierExpression('count'),
          }),
        }),
      ],
    }),
  ];
}
