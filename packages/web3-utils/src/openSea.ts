import {
  Address,
  createAddress,
  ChainId,
  CHAIN_ID,
} from '@openpalette/contract';
import { NullAddress } from 'utils';
import { isMainnetOrPolygon } from '.';

export function getOpenSeaUrl(
  chainId: ChainId,
  contractAddress: string,
  index: number,
) {
  const prefix = !isMainnetOrPolygon(chainId) ? `testnets.` : '';
  const chainName =
    chainId === CHAIN_ID.POLYGON || chainId === CHAIN_ID.MUMBAI ? 'matic/' : '';

  return `https://${prefix}opensea.io/assets/${chainName}${contractAddress}/${index}`;
}

const proxyAddressMap: Record<ChainId, Address> = {
  [CHAIN_ID.MAINNET]: createAddress(
    '0xa5409ec958c83c3f309868babaca7c86dcb077c1',
  ),
  [CHAIN_ID.RINKEBY]: createAddress(
    '0xf57b2c51ded3a29e6891aba85459d600256cf317',
  ),
  [CHAIN_ID.ROPSTEN]: createAddress(NullAddress),
  [CHAIN_ID.GOERLI]: createAddress(NullAddress),
  [CHAIN_ID.POLYGON]: createAddress(NullAddress),
  [CHAIN_ID.MUMBAI]: createAddress(NullAddress),
};

export function getProxyAddress(chainId: ChainId) {
  return proxyAddressMap[chainId];
}
