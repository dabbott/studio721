import { ContractConfigState } from 'state';
import { ContractContext } from '..';
import {
  assignmentExpression,
  AST,
  binaryExpression,
  blockComment,
  compact,
  declarationStatement,
  expressionStatement,
  forStatement,
  functionCallExpression,
  functionDeclaration,
  identifierExpression,
  ifStatement,
  literalExpression,
  memberExpression,
  parseVariableDeclaration,
  variableDeclaration,
} from 'solidity-language';

export function generateMinting(
  config: Omit<
    ContractConfigState,
    'activateAutomatically' | 'tokenURI' | 'usesUriStorage'
  >,
  context: ContractContext,
): (AST.Declaration | AST.BlockComment)[] {
  const {
    supply,
    price,
    multimint,
    enumerable,
    customMaxTokenId,
    requireAccessToken,
    limitPerWallet,
    onlyOwnerCanMint,
  } = config;
  const priceValue = Number(price ?? '0');
  const actualPrice = priceValue * 1000000000000000000;

  const hasPrice = priceValue > 0;
  const hasMultimint = (multimint ?? 1) > 1;

  const variables: (AST.VariableDeclaration | AST.StructDeclaration)[] =
    compact([
      requireAccessToken &&
        variableDeclaration({
          name: 'accessTokenAddress',
          typeAnnotation: 'address',
          modifiers: [
            'public',
            ...(!config.mutableAccessToken ? ['immutable'] : []),
          ],
        }),
      config.supply !== null &&
        parseVariableDeclaration(
          `uint256 public constant MAX_SUPPLY = ${supply}`,
        ),
      config.usesIdParameter &&
        customMaxTokenId !== undefined &&
        supply !== customMaxTokenId &&
        parseVariableDeclaration(
          `uint256 public constant MAX_TOKEN_ID = ${customMaxTokenId}`,
        ),
      hasMultimint &&
        parseVariableDeclaration(
          `uint256 public constant MAX_MULTIMINT = ${multimint ?? 1}`,
        ),
      hasPrice &&
        parseVariableDeclaration(
          `uint256 public constant PRICE = ${actualPrice}`,
        ),
      !enumerable &&
        parseVariableDeclaration(`Counters.Counter private supplyCounter`),
    ]);

  const checkAccessToken = expressionStatement({
    expression: functionCallExpression({
      callee: identifierExpression('require'),
      arguments: [
        config.usesIdParameter
          ? binaryExpression({
              lhs: identifierExpression('accessToken.ownerOf(id)'),
              operator: '==',
              rhs: context.msgSender,
            })
          : binaryExpression({
              lhs: functionCallExpression({
                callee: identifierExpression('accessToken.balanceOf'),
                arguments: [context.msgSender],
              }),
              operator: '>',
              rhs: literalExpression(0),
            }),
        identifierExpression(`"Access token not owned"`),
      ],
    }),
  });

  const mintStatements: AST.Statement[] = [
    ...(config.usesIdParameter && hasMultimint
      ? [
          declarationStatement({
            declaration: parseVariableDeclaration('uint256 id = ids[i]'),
          }),
        ]
      : []),
    ...(config.usesIdParameter && config.customMaxTokenId !== undefined
      ? [
          expressionStatement({
            expression: functionCallExpression({
              callee: identifierExpression('require'),
              arguments: [
                supply !== customMaxTokenId
                  ? identifierExpression(
                      `id < MAX_TOKEN_ID, "Invalid token id"`,
                    )
                  : identifierExpression(`id < MAX_SUPPLY, "Invalid token id"`),
              ],
            }),
          }),
        ]
      : []),
    ...(config.requireAccessToken
      ? [
          config.toggleAccessToken
            ? ifStatement({
                condition: identifierExpression('accessTokenIsActive'),
                body: [checkAccessToken],
              })
            : checkAccessToken,
        ]
      : []),
    ...(config.tokenParameters.length > 0 && !config.usesIdParameter
      ? [
          declarationStatement({
            declaration: variableDeclaration({
              name: 'id',
              typeAnnotation: 'uint256',
              modifiers: [],
              initializer: functionCallExpression({
                callee: identifierExpression('totalSupply'),
              }),
            }),
          }),
        ]
      : []),
    expressionStatement({
      expression: functionCallExpression({
        callee: identifierExpression('_mint'),
        arguments: [
          context.msgSender,
          config.usesIdParameter || config.tokenParameters.length > 0
            ? identifierExpression('id')
            : functionCallExpression({
                callee: identifierExpression('totalSupply'),
              }),
        ],
      }),
    }),
    ...(config.tokenParameters.length > 0
      ? [
          expressionStatement({
            expression: assignmentExpression({
              lhs: identifierExpression('tokenParametersMap[id]'),
              rhs: hasMultimint
                ? identifierExpression('parameters[i]')
                : identifierExpression('parameters'),
            }),
          }),
        ]
      : []),
    ...(!enumerable
      ? [
          expressionStatement({
            expression: memberExpression({
              object: identifierExpression('supplyCounter'),
              member: functionCallExpression({
                callee: identifierExpression('increment'),
              }),
            }),
          }),
        ]
      : []),
  ];

  const hasAllowlist =
    config.amountAllowedForOwner > 0 || config.allowlistDestinations.length > 0;

  const checkAndUpdateAllowedMint = ifStatement({
    condition: binaryExpression({
      lhs: functionCallExpression({
        callee: identifierExpression('allowedMintCount'),
        arguments: [context.msgSender],
      }),
      operator: '>=',
      rhs: literalExpression(
        config.usesIdParameter || hasMultimint ? `count` : 1,
      ),
    }),
    body: [
      expressionStatement({
        expression: functionCallExpression({
          callee: identifierExpression('updateMintCount'),
          arguments: [
            context.msgSender,
            literalExpression(
              config.usesIdParameter || hasMultimint ? `count` : 1,
            ),
          ],
        }),
      }),
    ],
    alternate: [
      expressionStatement({
        expression: functionCallExpression({
          callee: identifierExpression('revert'),
          arguments: [
            hasAllowlist && limitPerWallet !== undefined
              ? literalExpression(
                  `saleIsActive ? "Minting limit exceeded" : "Sale not active"`,
                )
              : literalExpression(`"Minting limit exceeded"`),
          ],
        }),
      }),
    ],
  });

  return [
    blockComment({ value: 'MINTING', commentType: '/*' }),
    ...variables,
    functionDeclaration({
      name: 'mint',
      modifiers: [
        'public',
        ...(hasPrice ? ['payable'] : []),
        'nonReentrant',
        ...(onlyOwnerCanMint ? ['onlyOwner'] : []),
      ],
      arguments: [
        ...(config.usesIdParameter
          ? hasMultimint
            ? ['uint256[] calldata ids']
            : ['uint256 id']
          : hasMultimint
          ? ['uint256 count']
          : []),
        ...(config.tokenParameters.length > 0
          ? hasMultimint
            ? ['TokenParameters[] calldata parameters']
            : ['TokenParameters calldata parameters']
          : []),
      ],
      body: [
        ...(config.usesIdParameter && hasMultimint
          ? [
              declarationStatement({
                declaration: parseVariableDeclaration(
                  'uint256 count = ids.length',
                ),
              }),
            ]
          : []),
        ...(hasAllowlist && limitPerWallet !== undefined
          ? [checkAndUpdateAllowedMint]
          : limitPerWallet !== undefined
          ? [
              expressionStatement({
                expression: functionCallExpression({
                  callee: identifierExpression('require'),
                  arguments: [
                    identifierExpression(`saleIsActive`),
                    literalExpression(`"Sale not active"`),
                  ],
                }),
              }),
              checkAndUpdateAllowedMint,
            ]
          : hasAllowlist
          ? [
              ifStatement({
                condition: identifierExpression('!saleIsActive'),
                body: [
                  ifStatement({
                    condition: binaryExpression({
                      lhs: functionCallExpression({
                        callee: identifierExpression('allowedMintCount'),
                        arguments: [context.msgSender],
                      }),
                      operator: '>=',
                      rhs: literalExpression(
                        config.usesIdParameter || hasMultimint ? `count` : 1,
                      ),
                    }),
                    body: [
                      expressionStatement({
                        expression: functionCallExpression({
                          callee: identifierExpression('updateMintCount'),
                          arguments: [
                            context.msgSender,
                            literalExpression(
                              config.usesIdParameter || hasMultimint
                                ? `count`
                                : 1,
                            ),
                          ],
                        }),
                      }),
                    ],
                    alternate: [
                      expressionStatement({
                        expression: functionCallExpression({
                          callee: identifierExpression('revert'),
                          arguments: [literalExpression(`"Sale not active"`)],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ]
          : [
              expressionStatement({
                expression: functionCallExpression({
                  callee: identifierExpression('require'),
                  arguments: [
                    identifierExpression(`saleIsActive`),
                    literalExpression(`"Sale not active"`),
                  ],
                }),
              }),
            ]),
        ...(supply !== null
          ? [
              expressionStatement({
                expression: functionCallExpression({
                  callee: identifierExpression('require'),
                  arguments: [
                    identifierExpression(
                      `totalSupply() ${
                        hasMultimint ? '+ count - 1 ' : ''
                      }< MAX_SUPPLY, "Exceeds max supply"`,
                    ),
                  ],
                }),
              }),
            ]
          : []),
        ...(hasMultimint
          ? [
              expressionStatement({
                expression: functionCallExpression({
                  callee: identifierExpression('require'),
                  arguments: [
                    identifierExpression(
                      `count <= MAX_MULTIMINT, "Mint at most ${multimint} at a time"`,
                    ),
                  ],
                }),
              }),
            ]
          : []),
        ...(hasPrice
          ? [
              expressionStatement({
                expression: functionCallExpression({
                  callee: identifierExpression('require'),
                  arguments: [
                    identifierExpression(
                      `msg.value >= ${
                        hasMultimint ? `PRICE * count` : `PRICE`
                      }, "Insufficient payment, ${price} ETH per item"`,
                    ),
                  ],
                }),
              }),
            ]
          : []),
        ...(config.requireAccessToken
          ? [
              declarationStatement({
                declaration: parseVariableDeclaration(
                  config.usesDelegatedContract
                    ? 'IERC721 accessToken = IERC721(accessTokenAddress)'
                    : 'ERC721 accessToken = ERC721(accessTokenAddress)',
                ),
              }),
            ]
          : []),
        ...(hasMultimint
          ? [
              forStatement({
                pre: 'uint256 i = 0',
                update: 'i < count',
                post: 'i++',
                body: mintStatements,
              }),
            ]
          : mintStatements),
      ],
    }),
    ...(!enumerable
      ? [
          functionDeclaration({
            name: 'totalSupply',
            modifiers: ['public', 'view'],
            arguments: [],
            returns: {
              typeAnnotation: 'uint256',
              modifiers: [],
            },
            body: [
              {
                type: 'returnStatement',
                expression: memberExpression({
                  object: identifierExpression('supplyCounter'),
                  member: functionCallExpression({
                    callee: identifierExpression('current'),
                  }),
                }),
              },
            ],
          }),
        ]
      : []),
  ];
}
