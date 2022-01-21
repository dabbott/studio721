import { useEffect, useState } from 'react';
import { ResponseEncoding } from 'utils';
import { fetchData } from 'utils';

export type PromiseState<T> =
  | {
      type: 'pending';
    }
  | {
      type: 'success';
      value: T;
    }
  | {
      type: 'failure';
      value: Error;
    };

export function mapPromiseState<A, B>(
  state: PromiseState<A>,
  f: (value: A) => B,
): PromiseState<B> {
  return state.type === 'success'
    ? { type: 'success', value: f(state.value) }
    : state;
}

export function useFetch<T>(
  url?: string,
  encoding: ResponseEncoding = 'json',
): PromiseState<T> {
  const [state, setState] = useState<PromiseState<T>>({ type: 'pending' });

  useEffect(() => {
    let isStale = false;

    async function getInfo() {
      try {
        if (!url) {
          setState({ type: 'pending' });

          return;
        }

        const data = await fetchData<T>(url, encoding as any);

        if (isStale) return;

        setState({ type: 'success', value: data as T });
      } catch (error) {
        if (isStale) return;

        setState({ type: 'failure', value: error } as any);
      }
    }

    getInfo();

    return () => {
      isStale = true;
    };
  }, [url, encoding]);

  return state;
}
