import { ContractConfigState } from 'state';
import {
  AST,
  blockComment,
  functionDeclaration,
  structDeclaration,
  structMemberDeclaration,
  variableDeclaration,
} from 'solidity-language';

export function generateTokenParameters(
  config: Pick<ContractConfigState, 'tokenParameters'>,
): (AST.Declaration | AST.BlockComment)[] {
  return [
    blockComment({ value: 'TOKEN PARAMETERS', commentType: '/*' }),
    structDeclaration({
      name: 'TokenParameters',
      body: config.tokenParameters.map((parameter) =>
        structMemberDeclaration({
          name: parameter.name,
          typeAnnotation: parameter.type,
        }),
      ),
    }),
    variableDeclaration({
      name: 'tokenParametersMap',
      modifiers: ['private'],
      typeAnnotation: 'mapping(uint256 => TokenParameters)',
    }),
    functionDeclaration({
      name: 'tokenParameters',
      arguments: ['uint256 tokenId'],
      modifiers: ['external', 'view'],
      returns: {
        modifiers: ['memory'],
        typeAnnotation: 'TokenParameters',
      },
      body: [
        {
          type: 'returnStatement',
          expression: {
            type: 'identifier',
            value: 'tokenParametersMap[tokenId]',
          },
        },
      ],
    }),
  ];
}
