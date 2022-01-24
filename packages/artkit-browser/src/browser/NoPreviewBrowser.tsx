import { Heading2, VStack } from 'components';
import { path } from 'imfs';
import React from 'react';
import { CollectionAction, CollectionState } from 'state';
import { FileBrowserView } from '../types';

function NoPreviewView({
  state,
  dispatch,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
}) {
  return (
    <VStack
      flex="1"
      alignItems={'center'}
      justifyContent={'center'}
      opacity={0.5}
    >
      <Heading2>No Preview Available</Heading2>
    </VStack>
  );
}

export const NoPreviewBrowser: FileBrowserView = {
  match(state) {
    return true;
  },
  title(state) {
    if (state.selectedFiles.length > 1) {
      return `${state.selectedFiles.length} Files`;
    }

    return path.basename(state.selectedFiles[0]);
  },
  View: NoPreviewView,
};
