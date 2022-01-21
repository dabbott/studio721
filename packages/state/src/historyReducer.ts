import produce from 'immer';
import {
  CollectionAction,
  collectionReducer,
  CollectionState,
  createInitialCollectionState,
} from './collectionReducer';

type Action = CollectionAction;
type State = CollectionState;

export type HistoryEntry = {
  actionType: Action['type'];
  timestamp: number;
  state: State;
};

export type HistoryState = {
  past: HistoryEntry[];
  present: State;
  future: HistoryEntry[];
};

export type HistoryAction = { type: 'undo' } | { type: 'redo' } | Action;

const FILE_CHANGED_TIMEOUT = 300;

export function historyReducer(state: HistoryState, action: HistoryAction) {
  const currentState = state.present;
  switch (action.type) {
    case 'setFileHandle': {
      const newState = createInitialHistoryState();
      newState.present = collectionReducer(currentState, action);
      return newState;
    }
    case 'undo':
      if (state.past.length === 0) {
        return state;
      } else {
        return produce(state, (draft) => {
          const nextPresent = draft.past.pop();

          if (nextPresent) {
            draft.future.unshift(
              createHistoryEntry(nextPresent.actionType, currentState),
            );
            draft.present = nextPresent.state;
          }
        });
      }
    case 'redo':
      if (state.future.length === 0) {
        return state;
      } else {
        return produce(state, (draft) => {
          const nextPresent = draft.future.shift();

          if (nextPresent) {
            draft.past.push(
              createHistoryEntry(nextPresent.actionType, currentState),
            );
            draft.present = nextPresent.state;
          }
        });
      }
    default:
      const nextState = collectionReducer(currentState, action);
      const mergableEntry = getMergableHistoryEntry(state, action.type);

      const changed = currentState.volume !== nextState.volume;

      return produce(state, (draft) => {
        const historyEntry = createHistoryEntry(action.type, currentState);

        if (changed && !action.type.includes('*')) {
          if (mergableEntry) {
            draft.past[draft.past.length - 1] = {
              ...historyEntry,
              state: mergableEntry.state,
            };
          } else {
            draft.past.push(historyEntry);
          }
          draft.future = [];
        }
        draft.present = nextState;
      });
  }
}

export function createInitialHistoryState(): HistoryState {
  return {
    past: [],
    present: createInitialCollectionState(),
    future: [],
  };
}

function createHistoryEntry(
  actionType: Action['type'],
  state: State,
): HistoryEntry {
  return {
    actionType,
    state,
    timestamp: Date.now(),
  };
}

function getMergableHistoryEntry(
  state: HistoryState,
  actionType: Action['type'],
): HistoryEntry | undefined {
  if (state.past.length === 0) {
    return;
  }

  const newTimestamp = Date.now();
  const previousEntry = state.past[state.past.length - 1];

  if (
    actionType !== previousEntry.actionType ||
    newTimestamp - previousEntry.timestamp > FILE_CHANGED_TIMEOUT
  ) {
    return;
  }

  return previousEntry;
}
