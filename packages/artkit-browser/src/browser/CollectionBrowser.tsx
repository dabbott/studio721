import { VirtualizedGrid, VStack } from 'components';
import { path, Volume } from 'imfs';
import React, { useMemo } from 'react';
import { AutoSizer } from 'react-virtualized';
import { CollectionAction, CollectionState, parseTokenMetadata } from 'state';
import { FileBrowserView } from '../types';
import { TokenCard } from './TokenCard';

function CollectionView({
  state,
  dispatch,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
}) {
  const { volume } = state;

  const files = useMemo(() => {
    try {
      return Volume.readDirectory(volume, '/metadata');
    } catch {
      return [];
    }
  }, [volume]);

  return (
    <VStack flex="1">
      <AutoSizer>
        {(size) => (
          <VirtualizedGrid
            size={size}
            items={files}
            rowHeight={(height) => height + 160}
            renderItem={({ item: name }) => {
              const filename = path.join('/metadata', name);

              return (
                <TokenCard
                  key={name}
                  volume={volume}
                  filename={name}
                  isEditable={true}
                  onChangeName={(value) => {
                    dispatch({
                      type: 'setTokenMetadataName',
                      files: [filename],
                      value,
                    });
                  }}
                  onChangeDescription={(value) => {
                    dispatch({
                      type: 'setTokenMetadataDescription',
                      files: [filename],
                      value,
                    });
                  }}
                  onChangeImage={async (file) => {
                    const data = await file.arrayBuffer();

                    dispatch({
                      type: 'setTokenMetadataImageFromComputer',
                      files: [filename],
                      name: file.name,
                      data: new Uint8Array(data),
                    });
                  }}
                  onOpen={() => {
                    dispatch({
                      type: 'selectFile',
                      files: filename,
                    });
                  }}
                  metadata={parseTokenMetadata(
                    Volume.readFile(volume, path.join('/metadata', name)),
                  )}
                />
              );
            }}
          />
        )}
      </AutoSizer>
    </VStack>
  );
}

export const CollectionBrowser: FileBrowserView = {
  match(state) {
    return (
      state.selectedFiles.length === 0 ||
      (state.selectedFiles.length === 1 &&
        (state.selectedFiles[0] === '/' ||
          state.selectedFiles[0] === '/metadata'))
    );
  },
  title(state) {
    return state.fileHandle
      ? path.basename(
          state.fileHandle.name,
          path.extname(state.fileHandle.name),
        )
      : 'Unsaved Collection';
  },
  View: CollectionView,
};
