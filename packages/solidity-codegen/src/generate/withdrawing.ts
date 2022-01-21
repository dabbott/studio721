import { PayoutDestination } from 'state';
import { ContractContext } from '..';
import {
  AST,
  binaryExpression,
  blockComment,
  expressionStatement,
  functionCallExpression,
  identifierExpression,
  literalExpression,
  parseVariableDeclaration,
} from 'solidity-language';

export function generateWithdrawing(
  {
    payoutDestinations,
  }: {
    payoutDestinations: PayoutDestination[];
  },
  context: ContractContext,
): (AST.Declaration | AST.BlockComment)[] {
  payoutDestinations = payoutDestinations.filter((d) => d.amount > 0);

  const total = payoutDestinations
    .map((item) => item.amount)
    .reduce((result, item) => result + item, 0);

  const destinations: { expression: AST.Expression; amount: number }[] = [
    ...(total < 100
      ? [
          {
            expression: context.owner,
            amount: 100 - total,
          },
        ]
      : []),
    ...payoutDestinations.map((destination, index) => {
      return {
        expression: identifierExpression(`payoutAddress${index + 1}`),
        amount: destination.amount,
      };
    }),
  ];

  return [
    blockComment({ value: 'PAYOUT', commentType: '/*' }),
    ...payoutDestinations.map((destination, index) =>
      parseVariableDeclaration(
        `address private constant payoutAddress${index + 1} = ${
          destination.address
        }`,
      ),
    ),
    {
      type: 'functionDeclaration',
      name: 'withdraw',
      arguments: [],
      modifiers: ['public', 'nonReentrant'],
      body: [
        {
          type: 'declarationStatement',
          declaration: {
            type: 'variableDeclaration',
            typeAnnotation: 'uint256',
            name: 'balance',
            modifiers: [],
            initializer: {
              type: 'memberExpression',
              object: {
                type: 'functionCallExpression',
                callee: identifierExpression('address'),
                arguments: [identifierExpression('this')],
              },
              member: identifierExpression('balance'),
            },
          },
        },
        ...destinations.map((destination) => {
          return expressionStatement({
            expression: {
              type: 'memberExpression',
              object: identifierExpression('Address'),
              member: functionCallExpression({
                callee: identifierExpression('sendValue'),
                arguments: [
                  functionCallExpression({
                    callee: identifierExpression('payable'),
                    arguments: [destination.expression],
                  }),
                  destination.amount !== 100
                    ? binaryExpression({
                        lhs: identifierExpression('balance'),
                        operator: '*',
                        rhs: binaryExpression({
                          lhs: literalExpression(destination.amount),
                          operator: '/',
                          rhs: literalExpression(100),
                        }),
                      })
                    : identifierExpression('balance'),
                ],
              }),
            },
          });
        }),
      ],
    },
  ];
}
