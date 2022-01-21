import {
  AutoSizer,
  Divider,
  HStack,
  Regular,
  SpacerHorizontal,
  VStack,
} from 'components';
import React from 'react';
import { useTheme } from 'styled-components';
import { CollectionState, HistoryAction, HistoryState } from 'state';
import { FileTree } from '../FileTree';
import { Menubar } from '../Menubar';
import { CodeBrowser } from './CodeBrowser';
import { CollectionBrowser } from './CollectionBrowser';
import { ImageBrowser } from './ImageBrowser';
import { NoPreviewBrowser } from './NoPreviewBrowser';
import { TokenBrowser } from './TokenBrowser';
import { WebsiteBrowser } from './WebsiteBrowser';

export type FileBrowserProps = {
  state: CollectionState;
  dispatch: (action: HistoryAction) => void;
};

export type FileBrowserView = {
  match(state: CollectionState): boolean;
  title(state: CollectionState): string;
  View: React.FunctionComponent<FileBrowserProps>;
  Toolbar?: React.FunctionComponent<FileBrowserProps>;
};

const browsers = [
  TokenBrowser,
  ImageBrowser,
  WebsiteBrowser,
  CodeBrowser,
  CollectionBrowser,
  NoPreviewBrowser,
];

export function FileSystemBrowser({
  historyState,
  dispatch,
}: {
  historyState: HistoryState;
  dispatch: (action: HistoryAction) => void;
}) {
  const state = historyState.present;
  const match = browsers.find((browser) => browser.match(state));
  const title = match?.title(state);

  const theme = useTheme();

  return (
    <VStack flex="1" margin={'60px 0 0 0'}>
      <HStack flex="1" alignItems="stretch">
        <VStack width={280} borderRight="1px solid black">
          <Menubar historyState={historyState} dispatch={dispatch} />
          <Divider />
          <AutoSizer>
            {(size) => (
              <FileTree size={size} state={state} dispatch={dispatch} />
            )}
          </AutoSizer>
        </VStack>
        <VStack flex="1">
          <HStack height={59} paddingHorizontal="20px" alignItems="center">
            <Regular
              background={theme.colors.inputBackground}
              fontWeight="bold"
              padding="0px 8px"
              borderRadius="4px"
            >
              {title}
            </Regular>
            <SpacerHorizontal size={100} />
            {match && match.Toolbar && (
              <HStack gap="20px">
                <match.Toolbar state={state} dispatch={dispatch} />
              </HStack>
            )}
          </HStack>
          <Divider />
          <VStack flex="1" background="rgba(0,0,0,0.2)">
            {match && <match.View state={state} dispatch={dispatch} />}
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
}
