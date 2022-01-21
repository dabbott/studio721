import { useRouter } from 'next/router';
import { useEffect, useMemo, useReducer } from 'react';

const SCHEMA_VERSION_KEY = 'schemaVersion';

export function decodeConfigParameter(configString: string) {
  try {
    const config = JSON.parse(decodeURIComponent(configString));
    delete config[SCHEMA_VERSION_KEY];
    return config;
  } catch {
    return {};
  }
}

export function encodeConfigParameter<S>(
  state: S,
  createInitialState: () => S,
): string {
  const json = JSON.stringify({
    ...cloneChangedProperties(state, createInitialState),
    [SCHEMA_VERSION_KEY]: '1.0.0',
  });

  return encodeURIComponent(json);
}

function cloneChangedProperties<S>(
  state: S,
  createInitialState: () => S,
): Partial<S> | undefined {
  const initialState = createInitialState();

  if (JSON.stringify(state) === JSON.stringify(initialState)) return;

  const clone = { ...state };

  (Object.entries(initialState) as [keyof S, any][]).forEach(([key, value]) => {
    if (JSON.stringify(clone[key]) === JSON.stringify(value)) {
      delete clone[key];
    }

    if (typeof clone[key] === 'object' && clone[key] !== null) {
      const result = cloneChangedProperties(
        state[key],
        () => initialState[key],
      );

      if (result === undefined) {
        delete clone[key];
      } else {
        clone[key] = result as any;
      }
    }
  });

  return clone;
}

export function useUrlConfigReducer<S, A>({
  reducer,
  createInitialState,
}: {
  reducer: (state: S, action: A) => S;
  createInitialState: (state?: Partial<S>) => S;
}): [state: S, dispatch: (action: A) => void] {
  const router = useRouter();

  // The initial config passed to `useReducer`
  const initialConfig = useMemo(() => {
    if (typeof router.query.config !== 'string') return {};

    return decodeConfigParameter(router.query.config);
  }, [router.query.config]);

  const [state, dispatch] = useReducer(
    reducer,
    createInitialState(initialConfig),
  );

  const updatedConfig = useMemo(() => {
    return `config=${encodeConfigParameter(state, createInitialState)}`;
  }, [createInitialState, state]);

  useEffect(() => {
    if (router.asPath.includes(updatedConfig)) return;

    router.replace(
      {
        query: updatedConfig,
      },
      undefined,
      {
        scroll: false,
        shallow: true,
      },
    );
  }, [updatedConfig, router]);

  return [state, dispatch];
}
