import { ChainId, CHAIN_ID, getChainName } from '@openpalette/contract';

export function getEtherActorBaseURL(chainId: ChainId) {
  const prefix =
    chainId !== CHAIN_ID.MAINNET ? `${getChainName(chainId)}.` : '';

  return `https://${prefix}ether.actor`;
}
