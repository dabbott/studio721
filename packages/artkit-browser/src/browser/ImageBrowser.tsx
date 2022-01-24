import { VStack } from 'components';
import { path } from 'imfs';
import React from 'react';
import { CollectionAction, CollectionState } from 'state';
import { ImageInspector } from '../inspector/ImageInspector';
import { FileBrowserView } from '../types';

function ImageView({
  state,
  dispatch,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
}) {
  return (
    <VStack flex="1">
      <ImageInspector volume={state.volume} filename={state.selectedFiles[0]} />
    </VStack>
  );
}

export function isImageFile(file: string) {
  return /\.(jpg|jpeg|png|svg)$/.test(file);
}

export const ImageBrowser: FileBrowserView = {
  match(state) {
    return (
      state.selectedFiles.length === 1 && state.selectedFiles.every(isImageFile)
    );
  },
  title(state) {
    return path.basename(state.selectedFiles[0]);
  },
  View: ImageView,
};
