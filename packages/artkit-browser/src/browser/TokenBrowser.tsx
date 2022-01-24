import { HStack, VirtualizedGrid, VStack } from 'components';
import { path, Volume } from 'imfs';
import React from 'react';
import { AutoSizer } from 'react-virtualized';
import { CollectionAction, CollectionState, parseTokenMetadata } from 'state';
import { TokenInspector } from '../inspector/TokenInspector';
import { FileBrowserView } from '../types';
import { TokenCard } from './TokenCard';

export function TokenView({
  state,
  dispatch,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
}) {
  const { volume } = state;

  const metadata = state.selectedFiles
    .map((name) => Volume.readFile(volume, name))
    .map(parseTokenMetadata);

  return (
    <HStack
      flex="1"
      breakpoints={{
        [1000]: {
          flexDirection: 'column',
        },
      }}
    >
      <TokenInspector state={state} dispatch={dispatch} />
      <VStack width="1px" background="rgba(0,0,0,0.1)" />
      <VStack flex="1">
        <AutoSizer>
          {(size) => (
            <VirtualizedGrid
              size={size}
              items={state.selectedFiles}
              rowHeight={(height) => height + 120}
              renderItem={({ item, index }) => {
                const name = path.basename(item, '.token.json');

                return (
                  <TokenCard
                    key={name}
                    filename={name}
                    metadata={metadata[index]}
                    isEditable={false}
                    volume={volume}
                    onChangeImage={async (file) => {
                      const data = await file.arrayBuffer();

                      dispatch({
                        type: 'setTokenMetadataImageFromComputer',
                        files: [item],
                        name: file.name,
                        data: new Uint8Array(data),
                      });
                    }}
                  />
                );
              }}
            />
          )}
        </AutoSizer>
      </VStack>
    </HStack>
  );
}

export function isTokenFile(file: string) {
  return file.endsWith('.token.json');
}

export const TokenBrowser: FileBrowserView = {
  match(state) {
    return (
      state.selectedFiles.length > 0 && state.selectedFiles.every(isTokenFile)
    );
  },
  title(state) {
    return state.selectedFiles.length > 1
      ? `${state.selectedFiles.length} Tokens`
      : 'Token ' + path.basename(state.selectedFiles[0], '.token.json');
  },
  View: TokenView,
};
