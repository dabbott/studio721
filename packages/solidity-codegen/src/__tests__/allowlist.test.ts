import { generateAllowlist } from '../generate/allowlist';
import { contractDeclaration, formatContract, print } from 'solidity-language';

describe('allowlist', () => {
  it('base', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateAllowlist({
        limitPerWallet: undefined,
        allowlistDestinations: [],
        amountAllowedForOwner: 0,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('mint limit per wallet', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateAllowlist({
        limitPerWallet: 5,
        allowlistDestinations: [],
        amountAllowedForOwner: 0,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('owner mint + mint limit per wallet', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateAllowlist({
        limitPerWallet: 5,
        allowlistDestinations: [],
        amountAllowedForOwner: 10,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});
