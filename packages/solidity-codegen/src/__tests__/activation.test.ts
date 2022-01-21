import { generateActivation } from '../generate/activation';
import { contractDeclaration, formatContract, print } from 'solidity-language';

describe('activation', () => {
  it('not active', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateActivation({
        initialValue: false,
        toggleAccessToken: false,
        mutableAccessToken: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('active', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateActivation({
        initialValue: true,
        toggleAccessToken: false,
        mutableAccessToken: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('toggle access token', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateActivation({
        initialValue: false,
        toggleAccessToken: true,
        mutableAccessToken: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('mutable access token', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateActivation({
        initialValue: false,
        toggleAccessToken: false,
        mutableAccessToken: true,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});
