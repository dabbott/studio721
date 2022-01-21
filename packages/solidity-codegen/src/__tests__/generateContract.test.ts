import { ScopedAccessToken } from 'state';
import {
  ContractContext,
  getValidContractName,
  isValidSolidityIdentifier,
} from '..';
import { generateMinting } from '../generate/minting';
import { generateTokenParameters } from '../generate/parameters';
import {
  contractDeclaration,
  formatContract,
  functionCallExpression,
  identifierExpression,
  memberExpression,
  print,
} from 'solidity-language';

const defaultAccessToken: ScopedAccessToken = {
  mainnet: '',
  ropsten: '',
  rinkeby: '',
  goerli: '',
  polygon: '',
  mumbai: '',
};

const context: ContractContext = {
  msgSender: memberExpression({
    object: identifierExpression('msg'),
    member: identifierExpression('sender'),
  }),
  owner: functionCallExpression({
    callee: identifierExpression('owner'),
  }),
};

describe('contract name', () => {
  it('valid identifier', () => {
    expect(isValidSolidityIdentifier('a')).toEqual(true);
    expect(isValidSolidityIdentifier('a9')).toEqual(true);
    expect(isValidSolidityIdentifier('_')).toEqual(true);
    expect(isValidSolidityIdentifier('$')).toEqual(true);

    expect(isValidSolidityIdentifier('9')).toEqual(false);
    expect(isValidSolidityIdentifier('-9')).toEqual(false);
    expect(isValidSolidityIdentifier('a b')).toEqual(false);
  });

  it('valid contract name', () => {
    expect(getValidContractName('a')).toEqual('a');
    expect(getValidContractName('9a')).toEqual('a');
    expect(getValidContractName('99a')).toEqual('a');
    expect(getValidContractName('a b')).toEqual('ab');

    expect(getValidContractName('')).toEqual('Contract');
    expect(getValidContractName('9')).toEqual('Contract');
    expect(getValidContractName('99')).toEqual('Contract');
    expect(getValidContractName('---')).toEqual('Contract');
  });
});

describe('parameters', () => {
  it('generate', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateTokenParameters({
        tokenParameters: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'uint256' },
        ],
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});

describe('minting', () => {
  const common = {
    tokenName: 'TestToken',
    shortName: 'TTKN',
    supply: 1000,
    usesIdParameter: false,
    enumerable: false,
    onlyOwnerCanMint: false,
    tokenParameters: [],
    payoutDestinations: [],
    amountAllowedForOwner: 0,
    allowlistDestinations: [],
    toggleAccessToken: false,
    mutableAccessToken: false,
    usesDelegatedContract: false,
  };

  it('base', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + enumerable', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          enumerable: true,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + onlyOwnerCanMint', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          onlyOwnerCanMint: true,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + no supply', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          supply: null,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + id', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          usesIdParameter: true,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + id + custom max id', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          usesIdParameter: true,
          customMaxTokenId: 10000,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + id + custom max id equal to supply', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          usesIdParameter: true,
          customMaxTokenId: common.supply,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + accessToken', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          requireAccessToken: defaultAccessToken,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + id + accessToken', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          usesIdParameter: true,
          requireAccessToken: defaultAccessToken,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + id + accessToken + toggleAccessToken', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          usesIdParameter: true,
          toggleAccessToken: true,
          requireAccessToken: defaultAccessToken,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          tokenParameters: [{ name: 'a', type: 'uint256' }],
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base + id + parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          usesIdParameter: true,
          tokenParameters: [{ name: 'a', type: 'uint256' }],
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('price', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          price: '0.01',
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('price + enumerable', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          price: '0.01',
          enumerable: true,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multimint', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          multimint: 20,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('id + multimint', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          multimint: 20,
          usesIdParameter: true,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('id + multimint + accessToken', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          multimint: 20,
          usesIdParameter: true,
          requireAccessToken: defaultAccessToken,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multimint + enumerable', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          multimint: 20,
          enumerable: true,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multimint + price', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          multimint: 20,
          price: '0.02',
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multimint + price + enumerable', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          multimint: 20,
          price: '0.02',
          enumerable: true,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multimint + parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          tokenParameters: [{ name: 'a', type: 'uint256' }],
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multimint + id + parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          usesIdParameter: true,
          tokenParameters: [{ name: 'a', type: 'uint256' }],
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('limit per wallet', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          limitPerWallet: 2,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('limit per wallet + multimint', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          limitPerWallet: 2,
          multimint: 2,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('owner can mint', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          amountAllowedForOwner: 5,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('owner can mint + limit per wallet', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          amountAllowedForOwner: 5,
          limitPerWallet: 2,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('owner can mint + multimint', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          multimint: 20,
          amountAllowedForOwner: 5,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('owner can mint + limit per wallet + multimint', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateMinting(
        {
          ...common,
          amountAllowedForOwner: 5,
          limitPerWallet: 2,
          multimint: 5,
        },
        context,
      ),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});
