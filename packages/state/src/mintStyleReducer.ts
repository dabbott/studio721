import { ChainId, CHAIN_ID } from '@openpalette/contract';
import produce from 'immer';

export const DEFAULT_FUNCTION_NAME = {
  PRICE: 'PRICE',
  MAX_SUPPLY: 'MAX_SUPPLY',
  MAX_MULTIMINT: 'MAX_MULTIMINT',
  totalSupply: 'totalSupply',
  saleIsActive: 'saleIsActive',
  mint: 'mint',
};

export const DEFAULT_PARAMETER_NAME = {
  mint: {
    count: 'count',
  },
};

export type AssetType = 'none' | 'image' | 'video' | 'webpage';

export type CoverAsset = {
  type: AssetType;
  url: string;
  size: {
    width: string;
    height: string;
  };
};

export type MintStyleAction =
  | {
      type: 'setContractAddress';
      value: string;
    }
  | {
      type: 'setChainId';
      value: ChainId;
    }
  | {
      type: 'setCreatorAddress';
      value: string;
    }
  | {
      type: 'setBackground';
      value: string;
    }
  | {
      type: 'setCardBackground';
      value: string;
    }
  | {
      type: 'setTitle';
      value: string;
    }
  | {
      type: 'setDescription';
      value: string;
    }
  | {
      type: 'setCoverAsset';
      value: {
        type: AssetType;
        url: string;
        size: {
          width: string;
          height: string;
        };
      };
    }
  | {
      type: 'setCoverAssetWidth';
      value: string;
    }
  | {
      type: 'setCoverAssetHeight';
      value: string;
    }
  | {
      type: 'setCoverAssetUrl';
      value: string;
    }
  | {
      type: 'setCoverAssetType';
      value: AssetType;
    }
  | {
      type: 'setPriceFunctionName';
      value: string;
    }
  | {
      type: 'setTotalSupplyFunctionName';
      value: string;
    }
  | {
      type: 'setMaxSupplyFunctionName';
      value: string;
    }
  | {
      type: 'setSaleIsActiveFunctionName';
      value: string;
    }
  | {
      type: 'setSaleIsActiveEnabled';
      value: boolean;
    }
  | {
      type: 'setMaxMultimintFunctionName';
      value: string;
    }
  | {
      type: 'setMintFunctionName';
      value: string;
    }
  | {
      type: 'setMintCountParameterName';
      value: string;
    };

export type DataSourceMapping<T = void> = T extends void
  ? {
      name: string;
      disabled?: boolean;
    }
  : {
      name: string;
      parameters: T;
    };

export type MintStyleState = {
  contractAddress: string;
  chainId?: ChainId;
  creatorAddress?: string;
  background: string;
  cardBackground: string;
  title?: string;
  description: string;
  coverAsset: CoverAsset;
  dataSources: {
    price: DataSourceMapping;
    totalSupply: DataSourceMapping;
    saleIsActive: DataSourceMapping;
    MAX_SUPPLY: DataSourceMapping;
    MAX_MULTIMINT: DataSourceMapping;
    mint: DataSourceMapping<{ count: string }>;
  };
};

export function mintStyleReducer(
  state: MintStyleState,
  action: MintStyleAction,
): MintStyleState {
  switch (action.type) {
    case 'setContractAddress':
      return produce(state, (draft) => {
        draft.contractAddress = action.value;
      });
    case 'setChainId':
      return produce(state, (draft) => {
        draft.chainId = action.value;
      });
    case 'setCreatorAddress':
      return produce(state, (draft) => {
        draft.creatorAddress = action.value;
      });
    case 'setBackground':
      return produce(state, (draft) => {
        draft.background = action.value;
      });
    case 'setCardBackground':
      return produce(state, (draft) => {
        draft.cardBackground = action.value;
      });
    case 'setTitle':
      return produce(state, (draft) => {
        draft.title = action.value;
      });
    case 'setDescription':
      return produce(state, (draft) => {
        draft.description = action.value;
      });
    case 'setCoverAsset':
      return produce(state, (draft) => {
        draft.coverAsset = action.value;
      });
    case 'setCoverAssetType':
      return produce(state, (draft) => {
        draft.coverAsset.type = action.value;

        if (action.value === 'none') {
          draft.coverAsset.url = '';
          draft.coverAsset.size = {
            width: '',
            height: '',
          };
        }
      });
    case 'setCoverAssetUrl':
      return produce(state, (draft) => {
        draft.coverAsset.url = action.value;
      });
    case 'setCoverAssetWidth':
      return produce(state, (draft) => {
        draft.coverAsset.size.width = action.value;
      });
    case 'setCoverAssetHeight':
      return produce(state, (draft) => {
        draft.coverAsset.size.height = action.value;
      });
    case 'setPriceFunctionName':
      return produce(state, (draft) => {
        draft.dataSources.price.name = action.value;
      });
    case 'setTotalSupplyFunctionName':
      return produce(state, (draft) => {
        draft.dataSources.totalSupply.name = action.value;
      });
    case 'setMaxSupplyFunctionName':
      return produce(state, (draft) => {
        draft.dataSources.MAX_SUPPLY.name = action.value;
      });
    case 'setSaleIsActiveFunctionName':
      return produce(state, (draft) => {
        draft.dataSources.saleIsActive.name = action.value;
      });
    case 'setSaleIsActiveEnabled':
      return produce(state, (draft) => {
        draft.dataSources.saleIsActive.disabled = !action.value;
      });
    case 'setMaxMultimintFunctionName':
      return produce(state, (draft) => {
        draft.dataSources.MAX_MULTIMINT.name = action.value;
      });
    case 'setMintFunctionName':
      return produce(state, (draft) => {
        draft.dataSources.mint.name = action.value;
      });
    case 'setMintCountParameterName':
      return produce(state, (draft) => {
        draft.dataSources.mint.parameters.count = action.value;
      });
  }
}

const legacyChainNameToId = (name: string) => {
  switch (name) {
    case 'rinkeby':
      return CHAIN_ID.RINKEBY;
    case 'mainnet':
      return CHAIN_ID.MAINNET;
  }
};

export function createInitialMintStyle(
  partial?: Partial<MintStyleState>,
): MintStyleState {
  const legacyChainName =
    partial && 'chainName' in partial ? (partial as any).chainName : undefined;

  const result: MintStyleState = {
    contractAddress: '',
    background: '#1c1c1c',
    cardBackground: '#282828',
    description: '',
    ...partial,
    ...(legacyChainName
      ? { chainId: legacyChainNameToId(legacyChainName) }
      : {}),
    coverAsset: {
      type: 'none',
      url: '',
      size: {
        width: '',
        height: '',
      },
      ...partial?.coverAsset,
    },
    dataSources: {
      price: {
        name: DEFAULT_FUNCTION_NAME.PRICE,
        ...partial?.dataSources?.price,
      },
      totalSupply: {
        name: DEFAULT_FUNCTION_NAME.totalSupply,
        ...partial?.dataSources?.totalSupply,
      },
      saleIsActive: {
        name: DEFAULT_FUNCTION_NAME.saleIsActive,
        ...partial?.dataSources?.saleIsActive,
      },
      MAX_MULTIMINT: {
        name: DEFAULT_FUNCTION_NAME.MAX_MULTIMINT,
        ...partial?.dataSources?.MAX_MULTIMINT,
      },
      MAX_SUPPLY: {
        name: DEFAULT_FUNCTION_NAME.MAX_SUPPLY,
        ...partial?.dataSources?.MAX_SUPPLY,
      },
      mint: {
        name: DEFAULT_FUNCTION_NAME.mint,
        parameters: {
          count: DEFAULT_PARAMETER_NAME.mint.count,
          ...partial?.dataSources?.mint?.parameters,
        },
        ...partial?.dataSources?.mint,
      },
    },
  };

  // Delete legacy chainName
  delete (result as any).chainName;

  return result;
}
