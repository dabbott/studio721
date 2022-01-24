import { MagicWandIcon } from '@radix-ui/react-icons';
import { Dialog, SpacerHorizontal, VStack } from 'components';
import { Button } from 'designsystem';
import { path } from 'imfs';
import React, { useState } from 'react';
// TODO: Improve package structure so we don't have to import like this
import { GenerateMetadataTool } from '../../../studio721/src/components/artkit/tools/GenerateMetadataTool';
import { WebsiteInspector } from '../inspector/WebsiteInspector';
import { FileBrowserProps, FileBrowserView } from '../types';

function WebsiteView({ state, dispatch }: FileBrowserProps) {
  return (
    <VStack flex="1">
      <WebsiteInspector state={state} dispatch={dispatch} />
    </VStack>
  );
}

function WebsiteToolbar({ state, dispatch }: FileBrowserProps) {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  return (
    <>
      <Dialog
        title={`Generate Images & Attributes`}
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
      >
        <GenerateMetadataTool
          state={state}
          onGenerate={(generated) => {
            setShowGenerateDialog(false);
            dispatch({
              type: 'setGeneratedMetadata',
              generated,
            });
          }}
        />
      </Dialog>
      <Button
        onClick={() => {
          setShowGenerateDialog(true);
        }}
      >
        <MagicWandIcon />
        <SpacerHorizontal inline size={8} />
        Generate Images &amp; Attributes...
      </Button>
    </>
  );
}

export function isWebsite(file: string) {
  return /\.(html)$/.test(file);
}

export const WebsiteBrowser: FileBrowserView = {
  match(state) {
    // if (
    //   state.selectedFiles.length === 1 &&
    //   state.selectedFiles[0] === '/assets' &&
    //   Volume.readDirectory(state.volume, state.selectedFiles[0]).includes(
    //     'index.html',
    //   )
    // ) {
    //   return true;
    // }

    return (
      state.selectedFiles.length === 1 && state.selectedFiles.every(isWebsite)
    );
  },
  title(state) {
    return `Website (${path.basename(state.selectedFiles[0])})`;
  },
  View: WebsiteView,
  Toolbar: WebsiteToolbar,
};
