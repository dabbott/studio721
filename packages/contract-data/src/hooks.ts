import { FunctionFragment } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { ChainId } from '@openpalette/contract';
import { useChainId } from 'contexts';
import { PromiseState } from 'hooks';
import { useEffect, useState } from 'react';
import { callReadOnlyContractFunction } from './call';
import { FunctionOutput } from './types';

export function useReadOnlyContractData<T = FunctionOutput>({
  fragment,
  contract,
  chainId,
  args,
}: {
  fragment?: FunctionFragment;
  contract?: Contract;
  chainId?: ChainId;
  args?: any[];
}): PromiseState<T> {
  const [result, setResult] = useState<PromiseState<T>>({
    type: 'pending',
  });
  const providerChainId = useChainId();

  useEffect(() => {
    let isStale = false;

    async function main() {
      try {
        if (!contract || !fragment || !chainId) return;

        const result = await callReadOnlyContractFunction<T>(
          chainId,
          fragment,
          contract,
          providerChainId,
          args,
        );

        if (isStale) return;

        setResult({ type: 'success', value: result });
      } catch (e) {
        if (isStale) return;

        setResult({ type: 'failure', value: e as Error });
      }
    }

    main();

    return () => {
      isStale = true;
    };
  }, [fragment, contract, chainId, providerChainId, args]);

  return result;
}
