import detectEthereumProvider from '@metamask/detect-provider';
import { Address, ChainId, createAddress } from '@openpalette/contract';
import { ethers } from 'ethers';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

export type MintFailure = {
  type: 'failure';
  reason: 'aborted' | 'error';
  message: string;
};

export type MintSuccess = {
  type: 'success';
  tokenIds: number[];
};

export type MintStatus = MintSuccess | MintFailure;

export type TokenParameters = Record<string, number>;

export type Web3ContextValue = {
  data?: {
    provider: ethers.providers.Web3Provider;
    address: Address;
    chainId: ChainId;
  };
  noWallet?: boolean;
  api: {
    connect: () => Promise<void>;
    disconnect: () => void;
  };
};

export type PaletteUsage = {
  canMintNueGeo: boolean;
  canMintGenomeBlocks: boolean;
};

const Web3Context = createContext<Web3ContextValue>({
  api: {
    connect: async () => {},
    disconnect: async () => {},
  },
});

type Action =
  | {
      type: 'connected';
      address: Address;
      provider: ethers.providers.Web3Provider;
      chainId: ChainId;
    }
  | {
      type: 'disconnect';
    };

function reducer(
  state: Web3ContextValue['data'] | undefined,
  action: Action,
): Web3ContextValue['data'] | undefined {
  switch (action.type) {
    case 'connected': {
      return {
        address: action.address,
        provider: action.provider,
        chainId: action.chainId,
      };
    }
  }

  if (!state) return state;

  switch (action.type) {
    case 'disconnect': {
      return undefined;
    }
  }
}

export const FAILURE_NOT_LOADED: MintFailure = {
  type: 'failure',
  reason: 'error',
  message: 'Something went wrong. Please reload the page.',
};

export const FAILURE_UNKNOWN: MintFailure = {
  type: 'failure',
  reason: 'error',
  message: 'An error occurred.',
};

export const FAILURE_ABORTED: MintFailure = {
  type: 'failure',
  reason: 'aborted',
  message: 'Aborted.',
};

export const Web3ContextProvider = ({
  children,
  mockData = false,
}: {
  children: ReactNode;
  mockData?: boolean;
}) => {
  const [data, dispatch] = useReducer(reducer, undefined);
  const [noWallet, setNoWallet] = useState<boolean | undefined>();

  const connect = useCallback(async () => {
    const injectedProvider = await detectEthereumProvider();
    const ethereum = injectedProvider as any;

    if (!ethereum) {
      setNoWallet(true);
      return;
    }

    async function handleAccountsChanged(accounts: string[]) {
      localStorage.setItem('shouldAutoconnect', JSON.stringify(true));

      const provider = new ethers.providers.Web3Provider(ethereum);

      const chainId = await ethereum.request({ method: 'eth_chainId' });

      dispatch({
        type: 'connected',
        address: createAddress(accounts[0]),
        provider,
        chainId,
      });
    }

    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged);

    ethereum.on('accountsChanged', handleAccountsChanged);

    ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('shouldAutoconnect');

    dispatch({
      type: 'disconnect',
    });
  }, []);

  const value: Web3ContextValue = {
    data,
    noWallet,
    api: {
      connect,
      disconnect,
    },
  };

  // Try to connect once on launch
  useEffect(() => {
    const shouldAutoconnect = localStorage.getItem('shouldAutoconnect');

    if (shouldAutoconnect && JSON.parse(shouldAutoconnect) === true) {
      connect();
    }
  }, [connect]);

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export function useWeb3Data(): Web3ContextValue['data'] {
  return useContext(Web3Context)?.data;
}

export function useAddress(): Address | undefined {
  return useContext(Web3Context)?.data?.address;
}

export function useWeb3API(): Web3ContextValue['api'] {
  return useContext(Web3Context).api;
}

export function useChainId(): ChainId | undefined {
  return useContext(Web3Context)?.data?.chainId;
}

export function useNoWallet(): boolean | undefined {
  return useContext(Web3Context)?.noWallet;
}
