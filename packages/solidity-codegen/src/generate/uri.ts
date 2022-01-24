import { ContractConfigState } from 'state';
import {
  assignmentExpression,
  AST,
  blockComment,
  declarationStatement,
  expressionStatement,
  functionCallExpression,
  functionDeclaration,
  identifierExpression,
  ifStatement,
  literalExpression,
  parseVariableDeclaration,
  returnStatement,
  variableDeclaration,
} from 'solidity-language';
import { parseURITemplate } from '../templateParser';

function getURIConfig(baseURI: string) {
  const tokenizedURI = parseURITemplate(baseURI);
  const tokens = tokenizedURI.type === 'success' ? tokenizedURI.value : [];

  const hasBaseURI = tokens.length > 0 && tokens[0].type === 'content';
  const isDefaultConfiguration =
    (tokens.length === 2 &&
      tokens[0].type === 'content' &&
      tokens[1].type === 'identifier' &&
      tokens[1].values[0] === 'tokenId') ||
    (tokens.length === 3 &&
      tokens[0].type === 'content' &&
      tokens[1].type === 'identifier' &&
      tokens[1].values[0] === 'tokenId' &&
      tokens[2].type === 'identifier' &&
      tokens[2].values[0] === 'parameters');
  const startsWithDefaultConfiguration =
    tokens.length >= 2 &&
    tokens[0].type === 'content' &&
    tokens[1].type === 'identifier' &&
    tokens[1].values[0] === 'tokenId';
  const usesParameters = tokens.some(
    (token) =>
      token.type === 'identifier' && token.values.includes('parameters'),
  );

  return {
    tokens,
    isDefaultConfiguration,
    startsWithDefaultConfiguration,
    hasBaseURI,
    usesParameters,
  };
}

function generateContractURI(uri: string) {
  return [
    parseVariableDeclaration(
      `string private customContractURI = ${JSON.stringify(encodeURI(uri))}`,
    ),
    functionDeclaration({
      name: 'setContractURI',
      arguments: ['string memory customContractURI_'],
      modifiers: ['external', 'onlyOwner'],
      body: [
        expressionStatement({
          expression: assignmentExpression({
            lhs: identifierExpression('customContractURI'),
            rhs: identifierExpression('customContractURI_'),
          }),
        }),
      ],
    }),
    functionDeclaration({
      name: 'contractURI',
      modifiers: ['public', 'view'],
      returns: { typeAnnotation: 'string', modifiers: ['memory'] },
      body: [returnStatement(identifierExpression('customContractURI'))],
    }),
  ];
}

export function generateURIHandling(
  config: Pick<
    ContractConfigState,
    | 'tokenParameters'
    | 'tokenURI'
    | 'usesUriStorage'
    | 'usesDelegatedContract'
    | 'contractURI'
  >,
): (AST.Declaration | AST.BlockComment)[] {
  const {
    tokens,
    isDefaultConfiguration,
    startsWithDefaultConfiguration,
    usesParameters,
  } = getURIConfig(config.tokenURI);

  const shouldReturnSimpleBaseURI =
    tokens.length === 1 ||
    (tokens.length === 2 &&
      usesParameters &&
      config.tokenParameters.length === 0);

  return [
    blockComment({ value: 'URI HANDLING', commentType: '/*' }),
    ...(config.contractURI ? generateContractURI(config.contractURI) : []),
    ...(!config.usesDelegatedContract
      ? [parseVariableDeclaration('string private customBaseURI')]
      : []),
    ...(config.usesUriStorage
      ? [
          variableDeclaration({
            name: 'tokenURIMap',
            modifiers: ['private'],
            typeAnnotation: 'mapping(uint256 => string)',
          }),
          functionDeclaration({
            name: 'setTokenURI',
            arguments: ['uint256 tokenId', 'string memory tokenURI_'],
            modifiers: ['external', 'onlyOwner'],
            body: [
              {
                type: 'expressionStatement',
                expression: {
                  type: 'assignmentExpression',
                  lhs: {
                    type: 'identifier',
                    value: 'tokenURIMap[tokenId]',
                  },
                  rhs: {
                    type: 'identifier',
                    value: 'tokenURI_',
                  },
                },
              },
            ],
          }),
        ]
      : []),
    functionDeclaration({
      name: 'setBaseURI',
      arguments: ['string memory customBaseURI_'],
      modifiers: ['external', 'onlyOwner'],
      body: [
        config.usesDelegatedContract
          ? expressionStatement({
              expression: functionCallExpression({
                callee: identifierExpression('_setBaseURI'),
                arguments: [
                  identifierExpression('customBaseURI_'),
                  literalExpression('""'),
                ],
              }),
            })
          : expressionStatement({
              expression: assignmentExpression({
                lhs: identifierExpression('customBaseURI'),
                rhs: identifierExpression('customBaseURI_'),
              }),
            }),
      ],
    }),
    ...(!config.usesDelegatedContract
      ? [
          functionDeclaration({
            name: '_baseURI',
            arguments: [],
            modifiers: [
              'internal',
              'view',
              'virtual',
              ...(config.usesDelegatedContract ? [] : ['override']),
            ],
            returns: { typeAnnotation: 'string', modifiers: ['memory'] },
            body: [
              {
                type: 'returnStatement',
                expression: {
                  type: 'identifier',
                  value: 'customBaseURI',
                },
              },
            ],
          }),
        ]
      : []),
    ...(!isDefaultConfiguration ||
    (usesParameters && config.tokenParameters.length > 0) ||
    config.usesUriStorage
      ? [
          functionDeclaration({
            name: 'tokenURI',
            arguments:
              // We need to include the parameter, even when we don't use it,
              // so that the function has the right signature
              shouldReturnSimpleBaseURI && !config.usesUriStorage
                ? ['uint256']
                : ['uint256 tokenId'],
            modifiers: [
              'public',
              'view',
              ...(config.usesDelegatedContract ? [] : ['override']),
            ],
            returns: { typeAnnotation: 'string', modifiers: ['memory'] },
            body: [
              ...(config.usesUriStorage
                ? [
                    declarationStatement({
                      declaration: parseVariableDeclaration(
                        'string memory tokenURI_ = tokenURIMap[tokenId]',
                      ),
                    }),
                    ifStatement({
                      condition: identifierExpression(
                        'bytes(tokenURI_).length > 0',
                      ),
                      body: [
                        returnStatement(identifierExpression('tokenURI_')),
                      ],
                    }),
                  ]
                : []),
              ...(usesParameters && config.tokenParameters.length > 0
                ? [
                    declarationStatement({
                      declaration: variableDeclaration({
                        name: 'parameters',
                        modifiers: ['memory'],
                        typeAnnotation: 'TokenParameters',
                        initializer: identifierExpression(
                          'tokenParametersMap[tokenId]',
                        ),
                      }),
                    }),
                  ]
                : []),
              {
                type: 'returnStatement',
                expression: shouldReturnSimpleBaseURI
                  ? functionCallExpression({
                      callee: identifierExpression('_baseURI'),
                    })
                  : functionCallExpression({
                      callee: identifierExpression('string'),
                      arguments: [
                        functionCallExpression({
                          callee: identifierExpression('abi.encodePacked'),
                          arguments: [
                            ...tokens.flatMap(
                              (token, index): AST.Expression[] => {
                                if (startsWithDefaultConfiguration) {
                                  if (index === 0) {
                                    return [
                                      identifierExpression(
                                        config.usesDelegatedContract
                                          ? '_tokenURI(tokenId)'
                                          : 'super.tokenURI(tokenId)',
                                      ),
                                    ];
                                  } else if (index === 1) {
                                    return [];
                                  }
                                }

                                switch (token.type) {
                                  case 'content':
                                    return [
                                      identifierExpression(
                                        JSON.stringify(token.values.join('')),
                                      ),
                                    ];
                                  case 'identifier': {
                                    const values = token.values[0];

                                    switch (values) {
                                      case 'tokenId':
                                        return [
                                          identifierExpression('tokenId'),
                                        ];
                                      case 'parameters':
                                        if (config.tokenParameters.length === 0)
                                          return [];

                                        return [
                                          identifierExpression('"?"'),
                                          ...intersperse(
                                            config.tokenParameters.flatMap(
                                              (parameter) => [
                                                identifierExpression(
                                                  `"${parameter.name}="`,
                                                ),
                                                identifierExpression(
                                                  parameter.type === 'string' ||
                                                    parameter.type === 'address'
                                                    ? `parameters.${parameter.name}`
                                                    : `parameters.${parameter.name}.toString()`,
                                                ),
                                              ],
                                            ),
                                            identifierExpression('"&"'),
                                            2,
                                          ),
                                        ];
                                      default:
                                        return [
                                          identifierExpression(
                                            JSON.stringify(
                                              token.values.join(''),
                                            ),
                                          ),
                                        ];
                                    }
                                  }
                                  default:
                                    throw new Error('Invalid');
                                }
                              },
                            ),
                          ],
                        }),
                      ],
                    }),
              },
            ],
          }),
        ]
      : []),
  ];
}

export default function intersperse<T>(
  elements: T[],
  separator: T,
  stride = 1,
) {
  return elements.flatMap((element, i) =>
    i === 0 || i % stride !== 0 ? [element] : [separator, element],
  );
}
