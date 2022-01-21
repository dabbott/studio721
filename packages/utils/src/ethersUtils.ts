import { FunctionFragment, Interface } from '@ethersproject/abi';
import { Provider } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';

type StateMutability = 'payable' | 'nonpayable' | 'view';

export type FunctionFragmentFilters = {
  name?: string;
  inputs?: number;
  outputs?: string[];
  stateMutability?: StateMutability | StateMutability[];
};

export function getFirstFunctionFragment(
  interface_: Interface,
  filters: FunctionFragmentFilters,
) {
  const results = getAllFunctionFragments(interface_, filters);

  return results.length > 0 ? results[0] : undefined;
}

export function getSignerFromProvider(provider: Provider) {
  return provider instanceof ethers.providers.Web3Provider
    ? provider.getSigner()
    : undefined;
}

export function getAllFunctionFragments(
  interface_: Interface,
  filters: FunctionFragmentFilters = {},
) {
  const results = interface_.fragments.filter(
    (fragment): fragment is FunctionFragment => fragment.type === 'function',
  );

  return applyFilters(results, [
    typeof filters.name === 'string' &&
      ((fragment: FunctionFragment) => fragment.name === filters.name),
    typeof filters.inputs === 'number' &&
      ((fragment) => fragment.inputs.length === filters.inputs),
    filters.stateMutability !== undefined &&
      ((fragment) =>
        Array.isArray(filters.stateMutability)
          ? (filters.stateMutability as string[]).includes(
              fragment.stateMutability,
            )
          : fragment.stateMutability === filters.stateMutability),
    filters.outputs !== undefined &&
      ((fragment) => {
        const filter = filters.outputs;

        if (fragment.outputs && filter) {
          return (
            fragment.outputs.length === filter.length &&
            fragment.outputs.every((item, index) => item.type === filter[index])
          );
        }

        return true;
      }),
  ]);
}

function applyFilters<T>(
  items: T[],
  filters: (((item: T) => boolean) | false | null | undefined)[],
): T[] {
  return filters.reduce(
    (result, filter) =>
      typeof filter === 'function' ? result.filter(filter) : result,
    items,
  );
}
