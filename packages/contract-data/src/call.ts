import { FunctionFragment } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ChainId } from '@openpalette/contract';
import { getEtherActorBaseURL } from 'web3-utils';
import { FunctionOutput } from './types';

export async function fetchEthorActorData({
  chainId,
  address,
  fragment,
  args = [],
}: {
  chainId: ChainId;
  address: string;
  fragment: FunctionFragment;
  args: any[];
}): Promise<FunctionOutput> {
  const components = [
    getEtherActorBaseURL(chainId),
    address,
    fragment.name,
    ...args,
  ];

  const response = await fetch(components.join('/'));

  const result = await response.text();

  let json: any;

  try {
    json = JSON.parse(result);
  } catch (e) {
    //
  }

  if (
    typeof json === 'object' &&
    json !== null &&
    typeof json.statusCode === 'number' &&
    json.statusCode > 200
  ) {
    throw new Error('Failed to fetch contract data');
  }

  if (fragment.outputs && fragment.outputs.length > 0) {
    const outputType = fragment.outputs[0].type;

    switch (outputType) {
      case 'uint256':
        return BigNumber.from(result);
      case 'bool':
        return result === 'true';
    }
  }

  return result;
}

export async function callReadOnlyContractFunction<T = FunctionOutput>(
  chainId: ChainId,
  fragment: FunctionFragment,
  contract: Contract,
  providerChainId?: ChainId,
  args?: any[],
): Promise<T> {
  if (fragment.stateMutability !== 'view') {
    throw new Error('Not a read-only function');
  }

  // Try fetching from both ether.actor and the connected provider.
  // Sometimes one will fail, so this gives a better change of
  // getting data quickly.
  const output: T = await Promise.any([
    fetchEthorActorData({
      chainId,
      address: contract.address,
      fragment,
      args: args ?? [],
    }),
    ...(contract.provider && providerChainId === chainId
      ? [contract.callStatic[fragment.name](...(args || []))]
      : []),
  ]).catch((errors) => Promise.reject(errors[0]));

  return output;
}
