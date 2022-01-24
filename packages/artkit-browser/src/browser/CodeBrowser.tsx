import { VStack } from 'components';
import { createFileData, fileDataToString } from 'files';
import { path, Volume } from 'imfs';
import React, { useCallback, useMemo } from 'react';
import { JavascriptPlaygrounds } from '../JavascriptPlaygrounds';
import { FileBrowserProps, FileBrowserView } from '../types';

function CodeView({ state, dispatch }: FileBrowserProps) {
  const { volume } = state;

  const entry = state.selectedFiles[0];

  const playgroundFiles = useMemo(
    () => ({
      [entry]: fileDataToString(Volume.readFile(volume, entry)),
    }),
    [volume, entry],
  );

  const onChangeFile = useCallback(
    (file, source) => {
      dispatch({
        type: 'writeFile',
        file,
        value: createFileData(source),
      });
    },
    [dispatch],
  );

  if (!entry || !playgroundFiles) return <></>;

  return (
    <VStack flex="1">
      <JavascriptPlaygrounds
        key={entry}
        entry={entry}
        files={playgroundFiles}
        onChangeFile={onChangeFile}
        playerPane="none"
      />
    </VStack>
  );
}

export function isCodeFile(file: string) {
  return /\.(jsx?|tsx?|css|html|json)$/.test(file);
}

export const CodeBrowser: FileBrowserView = {
  match(state) {
    return (
      state.selectedFiles.length === 1 && state.selectedFiles.every(isCodeFile)
    );
  },
  title(state) {
    return path.basename(state.selectedFiles[0]);
  },
  View: CodeView,
};
