export type MintState =
  | { type: 'ready' }
  | { type: 'chooseCount'; inputValue: string }
  | { type: 'minting' }
  | { type: 'success'; tokenIds: number[] }
  | { type: 'failure'; message: string; reason: 'error' | 'aborted' };

export type MintStateAction =
  | {
      type: 'mint';
    }
  | {
      type: 'reset';
    }
  | {
      type: 'success';
      tokenIds: number[];
    }
  | {
      type: 'failure';
      message: string;
      reason: 'error' | 'aborted';
    };

export function mintStateReducer(
  state: MintState,
  action: MintStateAction,
): MintState {
  switch (action.type) {
    case 'mint':
      return {
        type: 'minting',
      };
    case 'reset':
      return {
        type: 'ready',
      };
    case 'success':
      return { type: 'success', tokenIds: action.tokenIds };
    case 'failure':
      return {
        type: 'failure',
        message: action.message,
        reason: action.reason,
      };
  }
}
