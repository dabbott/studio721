import { Node, path, Volume } from 'imfs';
import { bundle } from 'packly';
import { useCallback, useMemo } from 'react';
import { CollectionAction, CollectionState } from 'state';
import { getEntryFile } from '../entryFile';
import { createFileData, FileData, fileDataToString } from 'files';
import { JavascriptPlaygrounds } from '../JavascriptPlaygrounds';
import React from 'react';

function getPlaygroundFiles(volume: Node<FileData>, entry: string) {
  const files: Record<string, string> = {};

  // Run the bundler just to see which files we need to pass into the playground
  bundle({
    entry,
    request: ({ url, origin }) => {
      if (/^(https?)?:\/\//.test(url)) return undefined;

      const fileUrl =
        origin && !url.startsWith('/') ? path.join(origin, '..', url) : url;

      let source: string;

      try {
        source = fileDataToString(Volume.readFile(volume, fileUrl));
      } catch (e) {
        return undefined;
      }

      files[fileUrl.slice(1)] = source;

      return source;
    },
  });

  return files;
}

export function WebsiteInspector({
  state,
  dispatch,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
}) {
  const { volume } = state;

  const entry = getEntryFile(volume, state.selectedFiles[0]);

  const playgroundFiles = useMemo(
    () => (entry ? getPlaygroundFiles(volume, entry) : undefined),
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
    <JavascriptPlaygrounds
      entry={entry}
      files={playgroundFiles}
      onChangeFile={onChangeFile}
      playerPane="full"
    />
  );
}
