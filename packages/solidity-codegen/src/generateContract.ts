import { ContractConfigState } from 'state';
import { generateActivation } from './generate/activation';
import { generateAllowlist } from './generate/allowlist';
import { generateImports } from './generate/imports';
import { generateMinting } from './generate/minting';
import { generateTokenParameters } from './generate/parameters';
import {
  generateProxyApprovalFunction,
  generateProxyContracts,
} from './generate/proxy';
import { generateRoyalties } from './generate/royalties';
import { generateURIHandling } from './generate/uri';
import { generateWithdrawing } from './generate/withdrawing';
import {
  assignmentExpression,
  AST,
  blockComment,
  compact,
  expressionStatement,
  formatProgram,
  functionCallExpression,
  identifierExpression,
  indexAccessExpression,
  literalExpression,
  memberExpression,
  print,
  usingDeclaration,
} from 'solidity-language';

export type ContractContext = {
  msgSender: AST.Expression;
  owner: AST.Expression;
};

const SOLIDITY_IDENTIFIER_RE = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/;

export function isValidSolidityIdentifier(name: string): boolean {
  return SOLIDITY_IDENTIFIER_RE.test(name);
}

export function getValidContractName(name: string) {
  let nameWithValidChars = name.replace(/[^a-zA-Z0-9$_]/g, '');

  while (
    nameWithValidChars.length > 1 &&
    /[^a-zA-Z$_]/.test(nameWithValidChars[0])
  ) {
    nameWithValidChars = nameWithValidChars.slice(1);
  }

  if (!isValidSolidityIdentifier(nameWithValidChars)) {
    return 'Contract';
  }

  return nameWithValidChars;
}

export function generateContractSource(config: ContractConfigState) {
  const { tokenName, shortName, price } = config;

  const priceValue = Number(price);
  const hasPrice = priceValue > 0;
  const validRoyaltyBps =
    config.royaltyBps && config.royaltyBps !== '0'
      ? config.royaltyBps
      : undefined;
  const hasWithdraw = hasPrice || validRoyaltyBps ? true : false;

  const context: ContractContext = {
    msgSender: memberExpression({
      object: identifierExpression('msg'),
      member: identifierExpression('sender'),
    }),
    owner: functionCallExpression({
      callee: identifierExpression(
        config.usesDelegatedContract ? '_owner' : 'owner',
      ),
    }),
  };

  const program: AST.Program = {
    license: 'MIT',
    pragma: { value: 'solidity ^0.8.9' },
    imports: generateImports({
      address: hasWithdraw,
      enumerable: config.enumerable,
      strings: config.tokenParameters.length > 0,
      royalties: !!validRoyaltyBps && !config.usesDelegatedContract,
      delegation: config.usesDelegatedContract,
      hasAccessToken: !!config.requireAccessToken,
    }),
    body: [
      ...(config.approvalProxyAddress ? generateProxyContracts() : []),
      {
        type: 'contractDeclaration',
        name: getValidContractName(tokenName),
        extends: [
          config.usesDelegatedContract
            ? 'ERC721Delegated'
            : config.enumerable
            ? 'ERC721Enumerable'
            : 'ERC721',
          ...(validRoyaltyBps && !config.usesDelegatedContract
            ? ['IERC2981']
            : []),
          'ReentrancyGuard',
          ...(config.usesDelegatedContract ? [] : ['Ownable']),
        ],
        body: [
          usingDeclaration({
            alias: 'Counters',
            forProperty: 'Counters.Counter',
          }),
          ...(config.tokenParameters.length > 0
            ? [
                usingDeclaration({
                  alias: 'Strings',
                  forProperty: 'uint256',
                }),
              ]
            : []),
          {
            type: 'constructorDeclaration',
            arguments: [
              ...(config.usesDelegatedContract ? ['address baseFactory'] : []),
              'string memory customBaseURI_',
              ...(config.requireAccessToken
                ? ['address accessTokenAddress_']
                : []),
              ...(config.approvalProxyAddress
                ? ['address proxyRegistryAddress_']
                : []),
            ],
            super: config.usesDelegatedContract
              ? functionCallExpression({
                  callee: identifierExpression(`ERC721Delegated`),
                  arguments: [
                    identifierExpression('baseFactory'),
                    literalExpression(`"${tokenName}"`),
                    literalExpression(`"${shortName}"`),
                    functionCallExpression({
                      callee: identifierExpression('ConfigSettings'),
                      arguments: {
                        royaltyBps: literalExpression(
                          validRoyaltyBps ? Number(validRoyaltyBps) * 100 : 0,
                        ),
                        uriBase: identifierExpression('customBaseURI_'),
                        uriExtension: literalExpression('""'),
                        hasTransferHook: literalExpression(false),
                      },
                    }),
                  ],
                })
              : functionCallExpression({
                  callee: identifierExpression('ERC721'),
                  arguments: [
                    literalExpression(`"${tokenName}"`),
                    literalExpression(`"${shortName}"`),
                  ],
                }),
            body: compact([
              !config.usesDelegatedContract &&
                expressionStatement({
                  expression: assignmentExpression({
                    lhs: identifierExpression('customBaseURI'),
                    rhs: identifierExpression('customBaseURI_'),
                  }),
                }),
              config.requireAccessToken &&
                expressionStatement({
                  expression: assignmentExpression({
                    lhs: identifierExpression('accessTokenAddress'),
                    rhs: identifierExpression('accessTokenAddress_'),
                  }),
                }),
              config.approvalProxyAddress &&
                expressionStatement({
                  expression: assignmentExpression({
                    lhs: identifierExpression('proxyRegistryAddress'),
                    rhs: identifierExpression('proxyRegistryAddress_'),
                  }),
                }),
              config.amountAllowedForOwner > 0 &&
                expressionStatement({
                  expression: assignmentExpression({
                    lhs: indexAccessExpression({
                      object: identifierExpression('allowedMintCountMap'),
                      index: config.usesDelegatedContract
                        ? context.msgSender
                        : context.owner,
                    }),
                    rhs: literalExpression(config.amountAllowedForOwner),
                  }),
                }),
              ...config.allowlistDestinations
                .filter((dest) => dest.amount > 0)
                .map((dest) =>
                  expressionStatement({
                    expression: assignmentExpression({
                      lhs: identifierExpression(
                        `allowedMintCountMap[${dest.address}]`,
                      ),
                      rhs: literalExpression(dest.amount),
                    }),
                  }),
                ),
            ]),
          },
          ...(config.tokenParameters.length > 0
            ? generateTokenParameters(config)
            : []),
          ...(config.amountAllowedForOwner > 0 ||
          config.allowlistDestinations.length > 0 ||
          config.limitPerWallet !== undefined
            ? generateAllowlist(config)
            : []),
          ...generateMinting(config, context),
          ...generateActivation({
            initialValue: config.activateAutomatically,
            toggleAccessToken: config.toggleAccessToken,
            mutableAccessToken: config.mutableAccessToken,
          }),
          ...generateURIHandling({
            tokenParameters: config.tokenParameters,
            tokenURI: config.tokenURI,
            usesUriStorage: config.usesUriStorage,
            usesDelegatedContract: config.usesDelegatedContract,
            contractURI: config.contractURI,
          }),
          ...(hasWithdraw
            ? generateWithdrawing(
                { payoutDestinations: config.payoutDestinations },
                context,
              )
            : []),
          ...(validRoyaltyBps && !config.usesDelegatedContract
            ? generateRoyalties({ royaltyBps: validRoyaltyBps })
            : []),
          ...(config.approvalProxyAddress
            ? generateProxyApprovalFunction({
                usesDelegatedContract: config.usesDelegatedContract,
              })
            : []),
        ],
      },
      blockComment({
        value: 'Contract created with Studio 721 v1.5.0\nhttps://721.so',
        commentType: '//',
      }),
    ],
  };

  return print(formatProgram(program));
}
