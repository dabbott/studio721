import {
  AST,
  binaryExpression,
  blockComment,
  functionDeclaration,
  identifierExpression,
  returnStatement,
} from 'solidity-language';

export function generateRoyalties(config: {
  royaltyBps: string;
}): (AST.Declaration | AST.BlockComment)[] {
  return [
    blockComment({ value: 'ROYALTIES', commentType: '/*' }),
    functionDeclaration({
      name: 'royaltyInfo',
      arguments: ['uint256', 'uint256 salePrice'],
      modifiers: ['external', 'view', 'override'],
      returns: {
        modifiers: [],
        typeAnnotation: 'address receiver, uint256 royaltyAmount',
      },
      body: [
        returnStatement(
          identifierExpression(
            `(address(this), (salePrice * ${
              Number(config.royaltyBps) * 100
            }) / 10000)`,
          ),
        ),
      ],
    }),
    functionDeclaration({
      name: 'supportsInterface',
      arguments: ['bytes4 interfaceId'],
      modifiers: ['public', 'view', 'virtual', 'override(ERC721, IERC165)'],
      returns: {
        modifiers: [],
        typeAnnotation: 'bool',
      },
      body: [
        returnStatement(
          binaryExpression({
            operator: '||',
            lhs: identifierExpression(
              'interfaceId == type(IERC2981).interfaceId',
            ),
            rhs: identifierExpression('super.supportsInterface(interfaceId)'),
          }),
        ),
      ],
    }),
  ];
}
