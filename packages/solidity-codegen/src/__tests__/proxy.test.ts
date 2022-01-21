import {
  generateProxyApprovalFunction,
  generateProxyContracts,
} from '../generate/proxy';
import { contractDeclaration, formatContract, print } from 'solidity-language';

describe('proxy', () => {
  it('approval function', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateProxyApprovalFunction({
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('approval function with delegation', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateProxyApprovalFunction({
        usesDelegatedContract: true,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('proxy contracts', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateProxyContracts(),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});
