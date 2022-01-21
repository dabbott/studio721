import { ChainId, CHAIN_ID, getChainName } from '@openpalette/contract';

export function isMainnetOrPolygon(
  chainId: ChainId,
): chainId is typeof CHAIN_ID.MAINNET | typeof CHAIN_ID.POLYGON {
  return chainId === CHAIN_ID.MAINNET || chainId === CHAIN_ID.POLYGON;
}

function getHost(chainId: ChainId) {
  switch (chainId) {
    case CHAIN_ID.POLYGON:
    case CHAIN_ID.MUMBAI:
      return `polygonscan.com`;
    default:
      return `etherscan.io`;
  }
}

export function getBlockExplorerName(chainId: ChainId) {
  switch (chainId) {
    case CHAIN_ID.POLYGON:
    case CHAIN_ID.MUMBAI:
      return `Polygonscan`;
    default:
      return `Etherscan`;
  }
}

export function getEtherscanAddressUrl(chainId: ChainId, address: string) {
  const prefix = !isMainnetOrPolygon(chainId)
    ? `${getChainName(chainId)}.`
    : '';

  return `https://${prefix}${getHost(chainId)}/address/${address}`;
}

export function getEtherscanApiUrl(chainId: ChainId) {
  const prefix = !isMainnetOrPolygon(chainId)
    ? `api-${getChainName(chainId)}`
    : 'api';

  return `https://${prefix}.${getHost(chainId)}/api`;
}
