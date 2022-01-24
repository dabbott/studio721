import {
  Address,
  CHAIN_ID,
  createAddress,
  getChainName,
  getContractAddress,
} from '@openpalette/contract';
import { CompilerOutput } from 'hardhat/types';
import produce from 'immer';
import { getProxyAddress } from 'web3-utils';
import { NullAddress, SolidityCompilerOutput } from 'utils';

export * from './utils/selection';

export const OPEN_ZEPPELIN_VERSION = '4.3.2';
export const GWEI_SLIM_VERSION = '1.0.3';

export type CompilerState =
  | {
      type: 'notStarted';
    }
  | {
      type: 'downloading';
    }
  | {
      type: 'ready';
      files: Record<string, string>;
    }
  | {
      type: 'error';
      errors: any[];
    }
  | {
      type: 'done';
      files: Record<string, string>;
      contracts: CompilerOutput['contracts'];
      sourceName: string;
      contractName: string;
    };

export type DeploymentState =
  | {
      type: 'notStarted';
    }
  | {
      type: 'deploying';
    }
  | {
      type: 'deployed';
      address: Address;
    };

export type VerificationState =
  | {
      type: 'notStarted';
      previousError?: Error;
    }
  | {
      type: 'verifying';
    }
  | {
      type: 'verified';
    };

export type EthereumChainName = ReturnType<typeof getChainName>;

export type ScopedAccessToken = Record<EthereumChainName, string>;

export type TokenParameterType = 'uint256' | 'string' | 'address';

export type TokenParameter = {
  name: string;
  type: TokenParameterType;
};

export type PayoutDestination = {
  address: Address;
  amount: number;
};

export type AllowlistDestination = {
  address: Address;
  amount: number;
};

export type ContractConfigState = {
  tokenName: string;
  shortName: string;
  tokenURI: string;
  contractURI?: string;
  supply: number | null;
  multimint?: number;
  limitPerWallet?: number;
  customMaxTokenId?: number;
  price?: string;
  royaltyBps?: string;
  activateAutomatically: boolean;
  enumerable: boolean;
  onlyOwnerCanMint: boolean;
  usesDelegatedContract: boolean;
  usesUriStorage: boolean;
  usesIdParameter: boolean;
  tokenParameters: TokenParameter[];
  requireAccessToken?: ScopedAccessToken;
  toggleAccessToken: boolean;
  mutableAccessToken: boolean;
  approvalProxyAddress?: ScopedAccessToken;
  payoutDestinations: PayoutDestination[];
  amountAllowedForOwner: number;
  allowlistDestinations: AllowlistDestination[];
};

type State = {
  config: ContractConfigState;
  compiler: CompilerState;
  deployment: DeploymentState;
  verification: VerificationState;
  apiKeys: {
    etherscan: string;
  };
};

type PayoutActions =
  | {
      type: 'addPayoutDestination';
    }
  | {
      type: 'removePayoutDestination';
      index: number;
    }
  | {
      type: 'setPayoutDestinationAddress';
      index: number;
      address: Address;
    }
  | {
      type: 'setPayoutDestinationAmount';
      index: number;
      amount: number;
    }
  | {
      type: 'movePayoutDestination';
      sourceIndex: number;
      destinationIndex: number;
    };

type AllowlistActions =
  | {
      type: 'addAllowlistDestination';
    }
  | {
      type: 'removeAllowlistDestination';
      index: number;
    }
  | {
      type: 'setAllowlistDestinationAddress';
      index: number;
      address: Address;
    }
  | {
      type: 'setAllowlistDestinationAmount';
      index: number;
      amount: number;
    }
  | {
      type: 'setAmountAllowedForOwner';
      amount: number;
    }
  | {
      type: 'moveAllowlistDestination';
      sourceIndex: number;
      destinationIndex: number;
    };

type TokenParameterActions =
  | {
      type: 'addTokenParameter';
    }
  | {
      type: 'removeTokenParameter';
      index: number;
    }
  | {
      type: 'setTokenParameterName';
      index: number;
      name: string;
    }
  | {
      type: 'setTokenParameterType';
      index: number;
      tokenType: TokenParameterType;
    }
  | {
      type: 'moveTokenParameter';
      sourceIndex: number;
      destinationIndex: number;
    };

export type Action =
  | TokenParameterActions
  | PayoutActions
  | AllowlistActions
  | {
      type: 'setConfig';
      config: Partial<ContractConfigState>;
    }
  | {
      type: 'setTokenName';
      value: string;
    }
  | {
      type: 'setShortName';
      value: string;
    }
  | {
      type: 'setTokenURI';
      value: string;
    }
  | {
      type: 'setContractURI';
      value?: string;
    }
  | {
      type: 'setSupply';
      value: number | null;
    }
  | {
      type: 'setMultiMint';
      value?: number;
    }
  | {
      type: 'setMintingLimitPerWallet';
      value?: number;
    }
  | {
      type: 'setPrice';
      value?: string;
    }
  | {
      type: 'setRoyaltyBps';
      value?: string;
    }
  | {
      type: 'setActivateAutomatically';
      value: boolean;
    }
  | {
      type: 'setEnumerable';
      value: boolean;
    }
  | {
      type: 'setOnlyOwnerCanMint';
      value: boolean;
    }
  | {
      type: 'setUsesUriStorage';
      value: boolean;
    }
  | {
      type: 'setUsesIdParameter';
      value: boolean;
    }
  | {
      type: 'setCustomMaxTokenId';
      value: number | undefined;
    }
  | {
      type: 'setToggleAccessToken';
      value: boolean;
    }
  | {
      type: 'setMutableAccessToken';
      value: boolean;
    }
  | {
      type: 'setAccessToken';
      value?: ScopedAccessToken;
    }
  | {
      type: 'setApprovalProxyAddress';
      value?: ScopedAccessToken;
    }
  | {
      type: 'downloadFiles';
    }
  | {
      type: 'setCompilerReady';
      value: Record<string, string>;
    }
  | {
      type: 'setCompilerDone';
      value: SolidityCompilerOutput;
      sourceName: string;
      contractName: string;
    }
  | {
      type: 'setDeploying';
    }
  | {
      type: 'setDeploymentAddress';
      value: Address;
    }
  | {
      type: 'deployFailure';
    }
  | {
      type: 'setEtherscanApiKey';
      value: string;
    }
  | {
      type: 'setVerifying';
    }
  | {
      type: 'setVerificationFailed';
      error: Error;
    }
  | {
      type: 'setVerified';
    }
  | {
      type: 'setUsesDelegatedContract';
      value: boolean;
    };

export function createDefaultConfig(): Partial<ContractConfigState> {
  return {
    customMaxTokenId: undefined,
    multimint: undefined,
    activateAutomatically: false,
    enumerable: false,
    usesIdParameter: false,
    requireAccessToken: undefined,
    toggleAccessToken: false,
    approvalProxyAddress: undefined,
  };
}

export function createOpenPaletteConfig(): Partial<ContractConfigState> {
  return {
    customMaxTokenId: undefined,
    multimint: 20,
    activateAutomatically: false,
    toggleAccessToken: false,
    enumerable: false,
    usesIdParameter: true,
    requireAccessToken: {
      mainnet: getContractAddress(CHAIN_ID.MAINNET),
      rinkeby: getContractAddress(CHAIN_ID.RINKEBY),
      ropsten: '',
      goerli: '',
      polygon: '',
      mumbai: '',
    },
    approvalProxyAddress: {
      mainnet: getProxyAddress(CHAIN_ID.MAINNET),
      rinkeby: getProxyAddress(CHAIN_ID.RINKEBY),
      ropsten: '',
      goerli: '',
      polygon: '',
      mumbai: '',
    },
  };
}

export function createInitialState(
  initialConfig: Partial<ContractConfigState>,
): State {
  return {
    config: {
      tokenName: 'TestToken',
      shortName: 'TTKN',
      tokenURI: 'https://www.721.so/api/example/metadata/{tokenId}',
      supply: 2000,
      customMaxTokenId: undefined,
      multimint: undefined,
      price: undefined,
      activateAutomatically: false,
      onlyOwnerCanMint: false,
      usesUriStorage: false,
      enumerable: false,
      usesIdParameter: false,
      requireAccessToken: undefined,
      toggleAccessToken: false,
      mutableAccessToken: false,
      tokenParameters: [],
      payoutDestinations: [],
      allowlistDestinations: [],
      amountAllowedForOwner: 0,
      usesDelegatedContract: false,
      ...initialConfig,
    },
    compiler: {
      type: 'notStarted',
    },
    deployment: {
      type: 'notStarted',
    },
    verification: {
      type: 'notStarted',
    },
    apiKeys: {
      etherscan:
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('etherscanApiKey') ?? ''
          : '',
    },
  };
}

function payoutReducer(
  state: ContractConfigState,
  action: PayoutActions,
): ContractConfigState {
  switch (action.type) {
    case 'setPayoutDestinationAddress': {
      const { index, address } = action;

      return produce(state, (draft) => {
        draft.payoutDestinations[index].address = address;
      });
    }
    case 'setPayoutDestinationAmount': {
      const { index, amount } = action;

      return produce(state, (draft) => {
        draft.payoutDestinations[index].amount = amount;
      });
    }
    case 'addPayoutDestination': {
      return produce(state, (draft) => {
        draft.payoutDestinations.push({
          address: createAddress(NullAddress),
          amount: 0,
        });
      });
    }
    case 'removePayoutDestination': {
      const { index } = action;

      return produce(state, (draft) => {
        draft.payoutDestinations.splice(index, 1);
      });
    }
    case 'movePayoutDestination': {
      const { sourceIndex, destinationIndex } = action;

      return produce(state, (draft) => {
        moveArrayItem(draft.payoutDestinations, sourceIndex, destinationIndex);
      });
    }
  }
}

function allowlistReducer(
  state: ContractConfigState,
  action: AllowlistActions,
): ContractConfigState {
  switch (action.type) {
    case 'setAmountAllowedForOwner': {
      const { amount } = action;

      return produce(state, (draft) => {
        draft.amountAllowedForOwner = amount;
      });
    }
    case 'setAllowlistDestinationAddress': {
      const { index, address } = action;

      return produce(state, (draft) => {
        draft.allowlistDestinations[index].address = address;
      });
    }
    case 'setAllowlistDestinationAmount': {
      const { index, amount } = action;

      return produce(state, (draft) => {
        draft.allowlistDestinations[index].amount = amount;
      });
    }
    case 'addAllowlistDestination': {
      return produce(state, (draft) => {
        draft.allowlistDestinations.push({
          address: createAddress(NullAddress),
          amount: 0,
        });
      });
    }
    case 'removeAllowlistDestination': {
      const { index } = action;

      return produce(state, (draft) => {
        draft.allowlistDestinations.splice(index, 1);
      });
    }
    case 'moveAllowlistDestination': {
      const { sourceIndex, destinationIndex } = action;

      return produce(state, (draft) => {
        moveArrayItem(
          draft.allowlistDestinations,
          sourceIndex,
          destinationIndex,
        );
      });
    }
  }
}

export function reducer(state: State, action: Action): State {
  const resetForConfigChange: Pick<State, 'compiler' | 'deployment'> = {
    compiler: {
      type: 'notStarted',
    },
    deployment: {
      type: 'notStarted',
    },
  };

  switch (action.type) {
    case 'setConfig': {
      const { config } = action;

      return produce(state, (draft) => {
        draft.config = { ...draft.config, ...config };
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }

    case 'setTokenParameterName': {
      const { index, name } = action;

      return produce(state, (draft) => {
        draft.config.tokenParameters[index].name = name;
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }
    case 'setTokenParameterType': {
      const { index, tokenType } = action;

      return produce(state, (draft) => {
        draft.config.tokenParameters[index].type = tokenType;
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }
    case 'addTokenParameter': {
      return produce(state, (draft) => {
        draft.config.tokenParameters.push({
          name: 'param' + draft.config.tokenParameters.length,
          type: 'uint256',
        });
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }
    case 'removeTokenParameter': {
      const { index } = action;

      return produce(state, (draft) => {
        draft.config.tokenParameters.splice(index, 1);
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }
    case 'moveTokenParameter': {
      const { sourceIndex, destinationIndex } = action;

      return produce(state, (draft) => {
        moveArrayItem(
          draft.config.tokenParameters,
          sourceIndex,
          destinationIndex,
        );
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }

    case 'setAmountAllowedForOwner':
    case 'setAllowlistDestinationAddress':
    case 'setAllowlistDestinationAmount':
    case 'addAllowlistDestination':
    case 'removeAllowlistDestination':
    case 'moveAllowlistDestination': {
      return produce(state, (draft) => {
        draft.config = allowlistReducer(state.config, action);
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }

    case 'setPayoutDestinationAddress':
    case 'setPayoutDestinationAmount':
    case 'addPayoutDestination':
    case 'removePayoutDestination':
    case 'movePayoutDestination': {
      return produce(state, (draft) => {
        draft.config = payoutReducer(state.config, action);
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }

    case 'setTokenName': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, tokenName: value },
        ...resetForConfigChange,
      };
    }
    case 'setShortName': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, shortName: value },
        ...resetForConfigChange,
      };
    }
    case 'setTokenURI': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, tokenURI: value },
        ...resetForConfigChange,
      };
    }
    case 'setContractURI': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, contractURI: value },
        ...resetForConfigChange,
      };
    }
    case 'setSupply': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, supply: value },
        ...resetForConfigChange,
      };
    }
    case 'setMultiMint': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, multimint: value },
        ...resetForConfigChange,
      };
    }
    case 'setMintingLimitPerWallet': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, limitPerWallet: value },
        ...resetForConfigChange,
      };
    }
    case 'setPrice': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, price: value },
        ...resetForConfigChange,
      };
    }
    case 'setRoyaltyBps': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, royaltyBps: value },
        ...resetForConfigChange,
      };
    }
    case 'setActivateAutomatically': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, activateAutomatically: value },
        ...resetForConfigChange,
      };
    }
    case 'setEnumerable': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, enumerable: value },
        ...resetForConfigChange,
      };
    }
    case 'setOnlyOwnerCanMint': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, onlyOwnerCanMint: value },
        ...resetForConfigChange,
      };
    }
    case 'setUsesUriStorage': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, usesUriStorage: value },
        ...resetForConfigChange,
      };
    }
    case 'setUsesIdParameter': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, usesIdParameter: value },
        ...resetForConfigChange,
      };
    }
    case 'setCustomMaxTokenId': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, customMaxTokenId: value },
        ...resetForConfigChange,
      };
    }
    case 'setAccessToken': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, requireAccessToken: value },
        ...resetForConfigChange,
      };
    }
    case 'setToggleAccessToken': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, toggleAccessToken: value },
        ...resetForConfigChange,
      };
    }
    case 'setMutableAccessToken': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, mutableAccessToken: value },
        ...resetForConfigChange,
      };
    }
    case 'setApprovalProxyAddress': {
      const { value } = action;
      return {
        ...state,
        config: { ...state.config, approvalProxyAddress: value },
        ...resetForConfigChange,
      };
    }
    case 'downloadFiles': {
      return { ...state, compiler: { type: 'downloading' } };
    }
    case 'setCompilerReady': {
      const { value } = action;
      return { ...state, compiler: { type: 'ready', files: value } };
    }
    case 'setCompilerDone': {
      const { value, contractName, sourceName } = action;

      if (state.compiler.type !== 'ready') return state;

      if ('errors' in value) {
        return {
          ...state,
          compiler: { type: 'error', errors: value.errors },
        };
      }

      return {
        ...state,
        compiler: {
          type: 'done',
          contracts: value.contracts,
          files: state.compiler.files,
          sourceName,
          contractName,
        },
      };
    }
    case 'setDeploying': {
      return { ...state, deployment: { type: 'deploying' } };
    }
    case 'deployFailure': {
      return { ...state, deployment: { type: 'notStarted' } };
    }
    case 'setDeploymentAddress': {
      const { value } = action;
      return { ...state, deployment: { type: 'deployed', address: value } };
    }
    case 'setEtherscanApiKey': {
      const { value } = action;
      return {
        ...state,
        apiKeys: {
          ...state.apiKeys,
          etherscan: value,
        },
      };
    }
    case 'setVerifying': {
      return { ...state, verification: { type: 'verifying' } };
    }
    case 'setVerified': {
      return { ...state, verification: { type: 'verified' } };
    }
    case 'setVerificationFailed': {
      const { error } = action;
      return {
        ...state,
        verification: { type: 'notStarted', previousError: error },
      };
    }
    case 'setUsesDelegatedContract': {
      const { value } = action;

      return produce(state, (draft) => {
        draft.config.usesDelegatedContract = value;
        draft.config.enumerable = false;
        draft.config.approvalProxyAddress = undefined;
        draft.compiler = resetForConfigChange.compiler;
        draft.deployment = resetForConfigChange.deployment;
      });
    }
  }
}

export function moveArrayItem<T>(
  array: T[],
  sourceIndex: number,
  destinationIndex: number,
) {
  const sourceItem = array[sourceIndex];

  array.splice(sourceIndex, 1);

  array.splice(
    sourceIndex < destinationIndex ? destinationIndex - 1 : destinationIndex,
    0,
    sourceItem,
  );
}
