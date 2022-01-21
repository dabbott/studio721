import { createAddress } from '@openpalette/contract';
import { ContractContext } from '..';
import { generateWithdrawing } from '../generate/withdrawing';
import {
  contractDeclaration,
  formatContract,
  functionCallExpression,
  identifierExpression,
  memberExpression,
  print,
} from 'solidity-language';

const context: ContractContext = {
  msgSender: memberExpression({
    object: identifierExpression('msg'),
    member: identifierExpression('sender'),
  }),
  owner: functionCallExpression({
    callee: identifierExpression('owner'),
  }),
};

const testAddress1 = createAddress(
  '0x5BF4be9de72713bFE39A30EbE0691afd5fb7413a',
);
const testAddress2 = createAddress(
  '0x61E1a6Ed9109F554Bb785815D9f2C65f4a4C41A5',
);

describe('withdrawing', () => {
  it('base', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateWithdrawing(
        {
          payoutDestinations: [],
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multiple destinations', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateWithdrawing(
        {
          payoutDestinations: [
            { address: testAddress1, amount: 25 },
            { address: testAddress2, amount: 35 },
          ],
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('no owner', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateWithdrawing(
        {
          payoutDestinations: [{ address: testAddress1, amount: 100 }],
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});
