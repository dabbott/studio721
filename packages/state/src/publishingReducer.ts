import { PromiseState } from 'hooks';

export type PublishingState =
  | { type: 'ready' }
  | { type: 'uploadingAssets'; value: PromiseState<string> }
  | {
      type: 'uploadingMetadata';
      rootAssetsCID?: string;
      value: PromiseState<string>;
    };

export type PublishingStateAction =
  | {
      type: 'reset';
    }
  | {
      type: 'setUploadingAssets';
      value: PromiseState<string>;
    }
  | {
      type: 'setUploadingMetadata';
      rootAssetsCID?: string;
      value: PromiseState<string>;
    };

export function publishingStateReducer(
  state: PublishingState,
  action: PublishingStateAction,
): PublishingState {
  switch (action.type) {
    case 'reset':
      return { type: 'ready' };
    case 'setUploadingAssets':
      return { type: 'uploadingAssets', value: action.value };
    case 'setUploadingMetadata':
      return {
        type: 'uploadingMetadata',
        value: action.value,
        rootAssetsCID:
          action.rootAssetsCID ??
          (state.type === 'uploadingMetadata'
            ? state.rootAssetsCID
            : undefined),
      };
  }
}
