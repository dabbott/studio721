import { generateRoyalties } from '../generate/royalties';
import { contractDeclaration, formatContract, print } from 'solidity-language';

describe('royalties', () => {
  it('base', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateRoyalties({
        royaltyBps: '10',
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});
