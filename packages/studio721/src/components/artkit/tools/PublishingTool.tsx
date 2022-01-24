import {
  CheckCircledIcon,
  ClipboardIcon,
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { createEntriesFromVolume, findAllTokenFiles } from 'artkit-collection';
import {
  Button as RainbowButton,
  Code,
  FormRow,
  FormSection,
  Heading3,
  HStack,
  LinkChip,
  Regular,
  ScrollableStack,
  Small,
  SpacerHorizontal,
  VStack,
} from 'components';
import { Button, InputField } from 'designsystem';
import { createCarBlob, FileData, fileDataToBytes } from 'files';
import { Node, Volume } from 'imfs';
import React, { ReactNode, useReducer, useRef, useState } from 'react';
import { PublishingState, publishingStateReducer } from 'state';
import { useTheme } from 'styled-components';
import { uploadToNFTStorage } from '../../../utils/nftStorage';

const inputStyle = {
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: 'monospace',
};

function CopyableInputRow({ value }: { value: string }) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <HStack gap={8} flex="1">
      <InputField.Root id="input-row">
        <InputField.Input
          ref={ref}
          value={value}
          type="text"
          style={inputStyle}
          onChange={() => {}}
        />
      </InputField.Root>
      <Button
        onClick={() => {
          ref.current?.select();
          document.execCommand('copy');
        }}
      >
        <SpacerHorizontal size={4} inline />
        <ClipboardIcon width={15} />
        <SpacerHorizontal size={4} inline />
      </Button>
    </HStack>
  );
}

const uploadPath = async (
  apiKey: string,
  volume: Node<FileData>,
  path: string,
  assetsRootCID?: string,
) => {
  const assets = Volume.getNode(volume, path);

  if (assets.type === 'file') {
    const blob = new Blob([fileDataToBytes(assets.data)]);

    return await uploadToNFTStorage({ apiKey, blob, isCar: false });
  }

  const entries = createEntriesFromVolume(assets, assetsRootCID);

  const { blob } = await createCarBlob(entries);

  const cid = await uploadToNFTStorage({ apiKey, blob, isCar: true });

  return cid;
};

function ProgressItem({ children }: { children: ReactNode }) {
  return (
    <HStack
      gap={6}
      alignItems="center"
      padding={10}
      background="rgba(0,0,0,0.1)"
    >
      {children}
    </HStack>
  );
}

const LOCALSTORAGE_KEY_NFT_STORAGE = 'nftStorageApiKey';

export function PublishingTool({
  volume,
  entry,
}: {
  volume: Node<FileData>;
  entry: string;
}) {
  const initialState: PublishingState = { type: 'ready' };
  const [publishingState, dispatchPublishing] = useReducer(
    publishingStateReducer,
    initialState,
  );
  const theme = useTheme();
  const [nftStorageApiKey, setNftStorageApiKey] = useState(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(LOCALSTORAGE_KEY_NFT_STORAGE) ?? ''
      : '',
  );

  return (
    <VStack gap={20} minWidth={'600px'}>
      {publishingState.type === 'ready' && (
        <>
          <Regular>
            Here you can upload your metadata files and any assets to IPFS, the
            distributed storage network. Files are hosted for free thanks to{' '}
            <LinkChip href="https://nft.storage" openInNewTab>
              https://nft.storage
            </LinkChip>
            .
          </Regular>
          <Regular>
            To upload using this tool, you'll first need to make an API key on
            their site. After you upload, you'll recieve an{' '}
            <code style={{ background: 'rgba(0,0,0,0.5)' }}>ipfs://...</code>{' '}
            URL that you can use in a smart contract.
          </Regular>
          <VStack paddingVertical={10} gap={30}>
            <FormSection title={<Heading3>Configuration</Heading3>}>
              <FormRow title="NFT Storage API Key">
                <InputField.Root id="input-nft-storage-api-key">
                  <InputField.Input
                    type="password"
                    placeholder="Paste your API key..."
                    value={nftStorageApiKey}
                    onChange={(value) => {
                      localStorage.setItem(LOCALSTORAGE_KEY_NFT_STORAGE, value);
                      setNftStorageApiKey(value);
                    }}
                  />
                </InputField.Root>
              </FormRow>
            </FormSection>
          </VStack>
          <HStack justifyContent="end">
            <RainbowButton
              disabled={!nftStorageApiKey}
              onClick={async () => {
                let assetsCID: string | undefined;
                let metadataCID: string | undefined;

                if (hasAssetsToUpload(volume)) {
                  console.log('has assets');

                  dispatchPublishing({
                    type: 'setUploadingAssets',
                    value: { type: 'pending' },
                  });

                  try {
                    assetsCID = await uploadPath(
                      nftStorageApiKey,
                      volume,
                      '/assets',
                    );
                  } catch (e) {
                    dispatchPublishing({
                      type: 'setUploadingAssets',
                      value: { type: 'failure', value: e as Error },
                    });

                    return;
                  }

                  dispatchPublishing({
                    type: 'setUploadingAssets',
                    value: { type: 'success', value: assetsCID },
                  });
                }

                console.log('ok!', assetsCID);

                dispatchPublishing({
                  type: 'setUploadingMetadata',
                  value: { type: 'pending' },
                  rootAssetsCID: assetsCID,
                });

                try {
                  metadataCID = await uploadPath(
                    nftStorageApiKey,
                    volume,
                    entry,
                    assetsCID,
                  );
                } catch (e) {
                  dispatchPublishing({
                    type: 'setUploadingMetadata',
                    value: { type: 'failure', value: e as Error },
                  });

                  return;
                }

                dispatchPublishing({
                  type: 'setUploadingMetadata',
                  value: { type: 'success', value: metadataCID },
                });
              }}
            >
              Publish to IPFS
            </RainbowButton>
          </HStack>
        </>
      )}
      {publishingState.type === 'uploadingAssets' &&
        publishingState.value.type === 'pending' && (
          <ProgressItem>
            <DotsHorizontalIcon
              width={20}
              height={20}
              className="flickerAnimation"
            />
            <Regular>Uploading /assets...</Regular>
          </ProgressItem>
        )}
      {publishingState.type === 'uploadingAssets' &&
        publishingState.value.type === 'failure' && (
          <>
            <ProgressItem>
              <ExclamationTriangleIcon width={20} height={20} color="red" />
              <Regular>Failed to upload /assets</Regular>
            </ProgressItem>
            <VStack height={200} background={theme.colors.inputBackground}>
              <ScrollableStack innerProps={{ padding: 10 }}>
                <Code>{publishingState.value.value.message}</Code>
              </ScrollableStack>
            </VStack>
          </>
        )}
      {((publishingState.type === 'uploadingAssets' &&
        publishingState.value.type === 'success') ||
        (publishingState.type === 'uploadingMetadata' &&
          publishingState.rootAssetsCID)) && (
        <>
          <ProgressItem>
            <CheckCircledIcon width={20} height={20} color="lightgreen" />
            <Regular>Uploaded assets</Regular>
            {/* <SpacerHorizontal size={40} />
                <InputField.Root>
                  <InputField.Input
                    value={`ipfs://${publishingState.value.value}`}
                    onChange={() => {}}
                  />
                </InputField.Root> */}
          </ProgressItem>
        </>
      )}
      {publishingState.type === 'uploadingMetadata' &&
        publishingState.value.type === 'pending' && (
          <ProgressItem>
            <DotsHorizontalIcon
              width={20}
              height={20}
              className="flickerAnimation"
            />
            <Regular>Uploading {entry}...</Regular>
          </ProgressItem>
        )}
      {publishingState.type === 'uploadingMetadata' &&
        publishingState.value.type === 'failure' && (
          <>
            <ProgressItem>
              <ExclamationTriangleIcon width={20} height={20} color="red" />
              <Regular>Failed to upload {entry}</Regular>
            </ProgressItem>
            <VStack height={200} background={theme.colors.inputBackground}>
              <ScrollableStack innerProps={{ padding: 10 }}>
                <Code>{publishingState.value.value.message}</Code>
              </ScrollableStack>
            </VStack>
          </>
        )}
      {publishingState.type === 'uploadingMetadata' &&
        publishingState.value.type === 'success' && (
          <>
            <ProgressItem>
              <CheckCircledIcon width={20} height={20} color="lightgreen" />
              <Regular>Uploaded metadata</Regular>
              <SpacerHorizontal size={40} />
            </ProgressItem>
            <Heading3>Done!</Heading3>
            <VStack gap={10} background="#24562f" padding={10} borderRadius={2}>
              <Small>
                If you're creating a contract with Studio 721, use this URI as
                your Token URI:
              </Small>
              <CopyableInputRow
                value={`ipfs://${publishingState.value.value}/{tokenId}.token.json`}
              />
            </VStack>
            <VStack
              gap={10}
              background="rgba(0,0,0,0.1)"
              padding={10}
              borderRadius={2}
            >
              <Small>Your metadata's IPFS URI:</Small>
              <CopyableInputRow
                value={`ipfs://${publishingState.value.value}`}
              />
            </VStack>
            <VStack gap={10}>
              <Small>
                You may also browse your uploaded{' '}
                {publishingState.rootAssetsCID && (
                  <>
                    <LinkChip
                      style={{
                        padding: '0',
                        background: 'none',
                      }}
                      href={`https://${publishingState.rootAssetsCID}.ipfs.dweb.link/`}
                      openInNewTab
                    >
                      assets
                    </LinkChip>
                    {' and '}
                  </>
                )}
                <LinkChip
                  style={{
                    padding: '0',
                    background: 'none',
                  }}
                  href={`https://${publishingState.value.value}.ipfs.dweb.link/`}
                  openInNewTab
                >
                  metadata
                </LinkChip>
                .
              </Small>
            </VStack>
          </>
        )}
    </VStack>
  );
}

function hasAssetsToUpload(volume: Node<FileData>) {
  const tokensWithInternalFiles = findAllTokenFiles(
    volume,
    (_name, metadata) =>
      (metadata.image?.startsWith('/') ||
        metadata.animation_url?.startsWith('/') ||
        metadata.external_url?.startsWith('/')) ??
      false,
  );

  console.log('has assets to upload?', { tokensWithInternalFiles });

  return tokensWithInternalFiles.length > 0;
}
