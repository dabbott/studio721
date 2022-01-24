import { fileOpen } from 'browser-fs-access';
import { LinkChip, ScrollableStack, SpacerVertical } from 'components';
import { Button, DropdownMenu, InputField } from 'designsystem';
import { File, Volume } from 'imfs';
import React from 'react';
import { CollectionAction, CollectionState, parseTokenMetadata } from 'state';
import { FileData } from 'files';
import { getMultiValue } from 'utils';
import { NFTMetadata, NFTMetadataAttribute } from 'web3-utils';
import { FormRow, FormSection } from 'components';
import { AttributesInspector } from './AttributesInspector';

type PickFileOption = 'computer' | 'internal';

export function TokenInspector({
  state,
  dispatch,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
}) {
  const { volume } = state;

  const selectedNodes = state.selectedFiles.map((name) =>
    Volume.getNode(volume, name),
  );

  const showTokenEditor =
    state.selectedFiles.length > 0 &&
    state.selectedFiles.every((file) => file.endsWith('.token.json'));

  const selectedTokensMetadataArray = showTokenEditor
    ? selectedNodes.map((node) =>
        parseTokenMetadata((node as File<FileData>).data),
      )
    : [];

  const selectedTokensMetadata: NFTMetadata = {
    name: getMultiValue(
      selectedTokensMetadataArray.map((metadata) => metadata.name ?? ''),
    ),
    description: getMultiValue(
      selectedTokensMetadataArray.map((metadata) => metadata.description ?? ''),
    ),
    image: getMultiValue(
      selectedTokensMetadataArray.map((metadata) => metadata.image ?? ''),
    ),
    animation_url: getMultiValue(
      selectedTokensMetadataArray.map(
        (metadata) => metadata.animation_url ?? '',
      ),
    ),
    external_url: getMultiValue(
      selectedTokensMetadataArray.map(
        (metadata) => metadata.external_url ?? '',
      ),
    ),
  };

  const attributes: NFTMetadataAttribute[][] = selectedTokensMetadataArray.map(
    (item) => item.attributes ?? [],
  );

  return (
    <ScrollableStack
      outerProps={{
        flex: '1',
      }}
      innerProps={{
        background: '#222',
        padding: '20px',
        gap: '30px',
      }}
    >
      <FormSection title="Overview">
        <FormRow title="Name" variant="medium">
          <InputField.Root id="input-token-name">
            <InputField.Input
              placeholder={
                selectedTokensMetadata.name === undefined
                  ? 'Multiple values'
                  : undefined
              }
              value={selectedTokensMetadata.name ?? ''}
              onChange={(value) => {
                dispatch({
                  type: 'setTokenMetadataName',
                  files: state.selectedFiles,
                  value,
                });
              }}
            />
          </InputField.Root>
        </FormRow>
        <FormRow title="Description" variant="medium">
          <InputField.Root id="input-token-description">
            <InputField.Input
              placeholder={
                selectedTokensMetadata.description === undefined
                  ? 'Multiple values'
                  : undefined
              }
              value={selectedTokensMetadata.description ?? ''}
              onChange={(value) => {
                dispatch({
                  type: 'setTokenMetadataDescription',
                  files: state.selectedFiles,
                  value,
                });
              }}
            />
          </InputField.Root>
        </FormRow>
        <FormRow
          title="Image"
          variant="medium"
          tooltip={
            <>
              The URL to the image of this token.
              <SpacerVertical size={20} />
              If your token is a different kind of multimedia (video, audio,
              website), then this field should be the URL of the{' '}
              <em>thumbnail image</em> for the token.
            </>
          }
        >
          <InputField.Root id="input-token-image">
            <InputField.Input
              placeholder={
                selectedTokensMetadata.image === undefined
                  ? 'Multiple values'
                  : undefined
              }
              value={selectedTokensMetadata.image ?? ''}
              onChange={(value) => {
                dispatch({
                  type: 'setTokenMetadataImage',
                  files: state.selectedFiles,
                  value,
                });
              }}
            />
          </InputField.Root>
          <DropdownMenu<PickFileOption>
            items={[
              {
                title: 'From Computer...',
                value: 'computer',
              },
              {
                title: 'From Collection Assets...',
                value: 'internal',
              },
            ]}
            onSelect={async (value) => {
              switch (value) {
                case 'internal':
                  return;
                case 'computer':
                  const file = await fileOpen();

                  if (!file.handle) return;

                  const data = await file.arrayBuffer();

                  dispatch({
                    type: 'setTokenMetadataImageFromComputer',
                    files: state.selectedFiles,
                    name: file.name,
                    data: new Uint8Array(data),
                  });

                  return;
              }
            }}
          >
            <Button>Pick File...</Button>
          </DropdownMenu>
        </FormRow>
        <FormRow
          title="Animation URL"
          variant="medium"
          tooltip={
            <>
              This field is optional, and typically not used for image NFTs.
              <br />
              <br />
              If this token is a kind of multimedia that's not an image, e.g.
              video, audio, or website, then this field should be the URL of
              that multimedia asset.
            </>
          }
        >
          <InputField.Root id="input-token-animation-url">
            <InputField.Input
              placeholder={
                selectedTokensMetadata.animation_url === undefined
                  ? 'Multiple values'
                  : undefined
              }
              value={selectedTokensMetadata.animation_url ?? ''}
              onChange={(value) => {
                dispatch({
                  type: 'setTokenMetadataAnimationUrl',
                  files: state.selectedFiles,
                  value,
                });
              }}
            />
          </InputField.Root>
        </FormRow>
        <FormRow
          title="External URL"
          variant="medium"
          tooltip={
            <>
              This field is optional. If this token has its own webpage
              somewhere, you can put the link to that here.
              <br />
              <br />
              For example, this page{' '}
              <LinkChip
                href="https://www.artblocks.io/token/194000049"
                openInNewTab
              >
                https://www.artblocks.io/token/194000049
              </LinkChip>{' '}
              describing Rotae #49 by Nadieh Bremer.
            </>
          }
        >
          <InputField.Root id="input-token-external-url">
            <InputField.Input
              placeholder={
                selectedTokensMetadata.external_url === undefined
                  ? 'Multiple values'
                  : undefined
              }
              value={selectedTokensMetadata.external_url ?? ''}
              onChange={(value) => {
                dispatch({
                  type: 'setTokenMetadataExternalUrl',
                  files: state.selectedFiles,
                  value,
                });
              }}
            />
          </InputField.Root>
        </FormRow>
      </FormSection>
      <AttributesInspector
        state={state}
        dispatch={dispatch}
        attributes={attributes}
      />
    </ScrollableStack>
  );
}
