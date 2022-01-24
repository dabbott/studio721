import { PlusIcon } from '@radix-ui/react-icons';
import { FileSystemHandle } from 'browser-fs-access';
import {
  Button as RainbowButton,
  Divider,
  FolderIcon,
  Heading1,
  LinkChip,
  Regular,
  SpacerHorizontal,
  SpacerVertical,
  VStack,
} from 'components';
import { Directory } from 'imfs';
import React, { useState } from 'react';
import { FileData } from 'files';
import {
  createBasicMetadataVolume,
  createGenerativeArtCollection,
  openCollectionFile,
} from 'artkit-collection';

export function CollectionWelcome({
  onInitialize,
}: {
  onInitialize: (options: {
    fileHandle?: FileSystemHandle;
    volume: Directory<FileData>;
  }) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <VStack
      flex="1"
      margin={'40px 0 0 0'}
      alignItems="center"
      justifyContent="center"
      padding={'40px'}
    >
      <VStack maxWidth={500}>
        <Heading1>Artkit</Heading1>
        <SpacerVertical size={20} />
        <Regular>
          Artkit is a tool for creating assets and metadata for NFT collections.
        </Regular>
        <SpacerVertical size={20} />
        <Regular>
          You can save and load your collection as a zip file at any time —{' '}
          <strong>make sure to save before quitting!</strong>
        </Regular>
        <SpacerVertical size={20} />
        <Regular>
          Not sure where to start? There's a{' '}
          <LinkChip href="/guide/studio/artkit">
            guide and video walkthrough!
          </LinkChip>
        </Regular>
        <SpacerVertical size={30} />
        {isLoading ? (
          <Regular className="flickerAnimation">Loading Collection...</Regular>
        ) : (
          <VStack gap={20}>
            <RainbowButton
              onClick={() => {
                onInitialize({ volume: createBasicMetadataVolume() });
              }}
            >
              <PlusIcon
                width={22.5}
                height={22.5}
                style={{ position: 'relative', top: '5px' }}
              />
              <SpacerHorizontal inline size={8} />
              New Collection
            </RainbowButton>
            <RainbowButton
              onClick={() => {
                onInitialize({ volume: createGenerativeArtCollection() });
              }}
            >
              <PlusIcon
                width={22.5}
                height={22.5}
                style={{ position: 'relative', top: '5px' }}
              />
              <SpacerHorizontal inline size={8} />
              New Generative Art Collection
            </RainbowButton>
            <Divider variant="light" />
            <RainbowButton
              onClick={async () => {
                setIsLoading(true);

                try {
                  const collection = await openCollectionFile();
                  onInitialize(collection);
                } catch {
                  //
                }

                setIsLoading(false);
              }}
            >
              <FolderIcon
                width={22.5}
                height={22.5}
                style={{ position: 'relative', top: '5px' }}
              />
              <SpacerHorizontal inline size={8} />
              Open Existing Collection
            </RainbowButton>
          </VStack>
        )}
        <SpacerVertical size={60} />
      </VStack>
    </VStack>
  );
}
