import { generateURIHandling } from '../generate/uri';
import { contractDeclaration, formatContract, print } from 'solidity-language';

describe('uri handling', () => {
  it('base uri only', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/',
        tokenParameters: [],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base uri only + unused parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{parameters}',
        tokenParameters: [],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base uri and token id', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}',
        tokenParameters: [],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('base uri + token id + suffix', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}.json',
        tokenParameters: [],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('token parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}{parameters}',
        tokenParameters: [{ name: 'a', type: 'uint256' }],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multiple token parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}{parameters}',
        tokenParameters: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'uint256' },
        ],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('multiple token parameters + file suffix', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}.json{parameters}',
        tokenParameters: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'uint256' },
        ],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('unused parameters', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}',
        tokenParameters: [{ name: 'a', type: 'uint256' }],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('usesUriStorage', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: true,
        tokenURI: 'https://example.com/',
        tokenParameters: [],
        usesDelegatedContract: false,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('delegation', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}',
        tokenParameters: [],
        usesDelegatedContract: true,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('delegation + multiple token parameters + file suffix', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}.json{parameters}',
        tokenParameters: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'uint256' },
        ],
        usesDelegatedContract: true,
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });

  it('contract uri', () => {
    const contract = contractDeclaration({
      name: 'Test',
      body: generateURIHandling({
        usesUriStorage: false,
        tokenURI: 'https://example.com/{tokenId}',
        tokenParameters: [],
        usesDelegatedContract: false,
        contractURI: 'https://example.com/contract.json',
      }),
      extends: [],
    });

    expect(print(formatContract(contract))).toMatchSnapshot();
  });
});
