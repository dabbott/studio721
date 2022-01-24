import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import {
  createBasicMetadataVolume,
  openCollectionFile,
  saveCollectionFile,
} from 'artkit-collection';
import { Dialog, HStack, SpacerHorizontal } from 'components';
import { Button, createSectionedMenu, DropdownMenu } from 'designsystem';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { HistoryAction, HistoryState } from 'state';
import { CollectionSizeTool } from './tools/CollectionSizeTool';
import { PublishingTool } from './tools/PublishingTool';

interface Props {
  historyState: HistoryState;
  dispatch: (action: HistoryAction) => void;
}

export const Menubar = memo(function Menubar({
  historyState,
  dispatch,
}: Props) {
  const state = historyState.present;

  const handleNew = useCallback(async () => {
    const answer = window.confirm(
      'Creating a new collection will replace your current one. Are you sure?',
    );

    if (answer === false) return;

    const volume = createBasicMetadataVolume();

    dispatch({ type: 'setFileHandle', fileHandle: undefined, volume });
  }, [dispatch]);

  const handleOpen = useCallback(async () => {
    const collection = await openCollectionFile();

    const answer = window.confirm(
      'Opening a collection will replace your current one. Are you sure?',
    );

    if (answer === false) return;

    dispatch({ type: 'setFileHandle', ...collection });
  }, [dispatch]);

  const handleSave = useCallback(
    async (action: 'save' | 'saveAs') => {
      const fileHandle = await saveCollectionFile(
        state.volume,
        action === 'save' ? state.fileHandle : undefined,
      );

      if (fileHandle) {
        dispatch({ type: 'setFileHandle', fileHandle });
      }
    },
    [state, dispatch],
  );

  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  const menuItems = useMemo(() => {
    return createSectionedMenu<string>([
      {
        title: 'File',
        items: [
          {
            value: 'new',
            title: 'New',
            shortcut: undefined, // Browsers don't allow overriding
          },
          { value: 'open', title: 'Open...', shortcut: 'Mod-o' },
          { value: 'save', title: 'Save', shortcut: 'Mod-s' },
          { value: 'saveAs', title: 'Save As...', shortcut: 'Mod-Shift-s' },
        ],
      },
      {
        title: 'Edit',
        items: createSectionedMenu<string>([
          {
            value: 'undo',
            title: 'Undo',
            disabled: !canUndo,
            shortcut: 'Mod-z',
            role: 'undo',
          },
          {
            value: 'redo',
            title: 'Redo',
            disabled: !canRedo,
            shortcut: 'Mod-Shift-z',
            role: 'redo',
          },
        ]),
      },
      {
        title: 'Tokens',
        items: [
          {
            title: 'Add token',
            value: 'addToken',
          },
          {
            title: 'Set collection size...',
            value: 'setCollectionSize',
          },
        ],
      },
      {
        title: 'Publish',
        items: [
          {
            value: 'publishToIpfs',
            title: 'Upload To IPFS...',
            shortcut: 'Mod-Shift-p',
          },
        ],
      },
    ]);
  }, [canRedo, canUndo]);

  // We currently clear the undo stack on save. Therefore, if
  // we're able to undo, that means there are unsaved changes.
  useEffect(() => {
    if (!canUndo) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();

      const message = 'You may have unsaved changes. Are you sure?';

      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handler);

    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [canUndo]);

  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showCollectionSizeDialog, setShowCollectionSizeDialog] =
    useState(false);

  const onSelectMenuItem = useCallback(
    (value: string) => {
      switch (value) {
        case 'new': {
          handleNew();
          return;
        }
        case 'open': {
          handleOpen();
          return;
        }
        case 'save':
        case 'saveAs': {
          handleSave(value);
          return;
        }
        case 'undo':
          dispatch({ type: 'undo' });
          return;
        case 'redo':
          dispatch({ type: 'redo' });
          return;
        case 'publishToIpfs':
          setShowPublishDialog(true);
          return;
        case 'addToken':
          dispatch({ type: 'addToken' });
          return;
        case 'setCollectionSize':
          setShowCollectionSizeDialog(true);
          return;
      }
    },
    [dispatch, handleNew, handleOpen, handleSave],
  );

  return (
    <>
      <Dialog
        title={`Publish`}
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
      >
        <PublishingTool volume={state.volume} entry="/metadata" />
      </Dialog>
      <Dialog
        title={`Collection Size`}
        open={showCollectionSizeDialog}
        onOpenChange={setShowCollectionSizeDialog}
      >
        <CollectionSizeTool
          state={state}
          onSetSize={(options) => {
            setShowCollectionSizeDialog(false);
            dispatch({
              type: 'setCollectionSize',
              ...options,
            });
          }}
        />
      </Dialog>
      <HStack paddingVertical={16}>
        <SpacerHorizontal size={16} />
        <DropdownMenu items={menuItems} onSelect={onSelectMenuItem}>
          <Button id="menu">
            <HamburgerMenuIcon />
          </Button>
        </DropdownMenu>
        <SpacerHorizontal size={16} />
      </HStack>
    </>
  );
});
