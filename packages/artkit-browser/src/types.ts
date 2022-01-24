import { CollectionState, HistoryAction } from 'state';

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
