import fetch from 'cross-fetch';
import {
  ContractConfigState,
  createInitialState,
  GWEI_SLIM_VERSION,
  OPEN_ZEPPELIN_VERSION,
} from 'state';
import { downloadDependenciesForSource, generateContractSource } from '..';
import {
  createCompilerInput,
  getCompiler,
  SolidityCompiler,
} from 'solidity-compiler';
import { createAddress } from '@openpalette/contract';

jest.setTimeout(30000);

let compiler: SolidityCompiler;

beforeAll(async () => {
  compiler = await getCompiler();
});

const libraryVersions = {
  '@openzeppelin/contracts': OPEN_ZEPPELIN_VERSION,
  'gwei-slim-nft-contracts': GWEI_SLIM_VERSION,
};

const complexInput: Partial<ContractConfigState> = {
  tokenURI:
    'https://www.721.so/api/example/metadata/{tokenId}.json{parameters}',
  multimint: 20,
  price: '0.02',
  activateAutomatically: true,
  usesUriStorage: true,
  usesIdParameter: true,
  requireAccessToken: {
    mainnet: '0x1308c158e60D7C4565e369Df2A86eBD853EeF2FB',
    rinkeby: '0x6C989C4Eda8E3fABce543Af5bfaa0D67b256354e',
    ropsten: '',
    goerli: '',
    polygon: '',
    mumbai: '',
  },
  tokenParameters: [{ name: 'param0', type: 'uint256' }],
  payoutDestinations: [
    {
      address: createAddress('0x0000000000000000000000000000000000000000'),
      amount: 50,
    },
  ],
  allowlistDestinations: [
    {
      address: createAddress('0x0000000000000000000000000000000000000000'),
      amount: 1,
    },
  ],
  amountAllowedForOwner: 2,
  approvalProxyAddress: {
    mainnet: '0xa5409ec958c83c3f309868babaca7c86dcb077c1',
    rinkeby: '0xf57b2c51ded3a29e6891aba85459d600256cf317',
    ropsten: '',
    goerli: '',
    polygon: '',
    mumbai: '',
  },
  limitPerWallet: 5,
  royaltyBps: '10',
};

it('compiles', async () => {
  const state = createInitialState({});

  const source = generateContractSource(state.config);

  const files = await downloadDependenciesForSource(
    fetch,
    'Test.sol',
    source,
    libraryVersions,
  );

  const compiled = compiler.compile(createCompilerInput(files));

  expect(Object.keys(compiled.sources)).toMatchSnapshot();
});

it('compiles complex', async () => {
  const state = createInitialState(complexInput);

  const source = generateContractSource(state.config);

  const files = await downloadDependenciesForSource(
    fetch,
    'Test.sol',
    source,
    libraryVersions,
  );

  const compiled = compiler.compile(createCompilerInput(files));

  expect(Object.keys(compiled.sources)).toMatchSnapshot();
});

it('compiles + delegation', async () => {
  const state = createInitialState({
    usesDelegatedContract: true,
  });

  const source = generateContractSource(state.config);

  const files = await downloadDependenciesForSource(
    fetch,
    'Test.sol',
    source,
    libraryVersions,
  );

  const compiled = compiler.compile(createCompilerInput(files));

  expect(Object.keys(compiled.sources)).toMatchSnapshot();
});

it('compiles complex + delegation', async () => {
  const state = createInitialState({
    ...complexInput,
    usesDelegatedContract: true,
  });

  const source = generateContractSource(state.config);

  const files = await downloadDependenciesForSource(
    fetch,
    'Test.sol',
    source,
    libraryVersions,
  );

  const compiled = compiler.compile(createCompilerInput(files));

  expect(Object.keys(compiled.sources)).toMatchSnapshot();
});
