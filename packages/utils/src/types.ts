import { IERC721Contract } from '@openpalette/contract';
import { ethers } from 'ethers';

export interface OpenPalette {
  id: number;
  colors: string[];
  canMintNueGeo: boolean;
  canMintGenome: boolean;
  canMintBlockParty: boolean;
}

export type Brand<K, T> = K & { __brand: T };

export type DisconnectedContract = Brand<ethers.Contract, 'disconnected'>;
export type ReadonlyContract = Brand<ethers.Contract, 'readonly'>;

export const NullAddress = '0x0000000000000000000000000000000000000000';

export type ERC721Contract = ethers.Contract & IERC721Contract;

// These types propagate generics through memo and forwardRef to support generic components
//
// https://stackoverflow.com/questions/60386614/how-to-use-props-with-generics-with-react-memo/60389122#60389122
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012
declare module 'react' {
  function memo<A, B>(
    Component: (props: A) => B,
  ): (props: A) => ReactElement | null;

  function forwardRef<T, P = Record<string, never>>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null,
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}
