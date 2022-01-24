import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import { FileIcon, Pencil1Icon } from '@radix-ui/react-icons';
import {
  EditableTextArea,
  FileDropTarget,
  HStack,
  Label,
  Regular,
  SpacerHorizontal,
  VStack,
} from 'components';
import { Button } from 'designsystem';
import { FileData, fileDataToBytes } from 'files';
import { Node, path, Volume } from 'imfs';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { NFTMetadata, populateTemplateMetadata } from 'web3-utils';

export const ImagePreview = styled.img({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
});

export function useTokenImageUrl(
  volume: Node<FileData>,
  imageUrl: string | undefined,
) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>();

  const fileData = useMemo(() => {
    if (imageUrl?.startsWith('/')) {
      try {
        return Volume.readFile(volume, imageUrl);
      } catch (e) {
        // console.warn(e);
      }
    }

    return undefined;
  }, [imageUrl, volume]);

  useEffect(() => {
    if (fileData) {
      const bytes = fileDataToBytes(fileData);
      const url = URL.createObjectURL(new Blob([bytes]));

      setResolvedImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setResolvedImageUrl(imageUrl);
    }
  }, [imageUrl, fileData]);

  return resolvedImageUrl;
}

export function TokenCard({
  filename,
  metadata,
  onOpen,
  isEditable,
  onChangeName,
  onChangeDescription,
  onChangeImage,
  volume,
}: {
  filename: string;
  metadata: NFTMetadata;
  onOpen?: () => void;
  isEditable: boolean;
  onChangeName?: (value: string) => void;
  onChangeDescription?: (value: string) => void;
  onChangeImage?: (value: File) => void;
  volume: Node<FileData>;
}) {
  const tokenId = path.basename(filename, '.token.json');
  const populatedMetadata = useMemo(
    () => populateTemplateMetadata(metadata, { tokenId }),
    [metadata, tokenId],
  );
  const theme = useTheme();
  const [editing, setEditing] = useState(false);

  const resolvedImageUrl = useTokenImageUrl(volume, populatedMetadata.image);

  return (
    <VStack>
      <VStack
        background={theme.colors.background}
        borderRadius={4}
        boxShadow="0 2px 4px rgba(0,0,0,0.2)"
      >
        <VStack padding={20} gap={8}>
          <HStack alignItems="center">
            <Regular position="relative">
              <EditableTextArea
                value={(editing ? metadata.name : populatedMetadata.name) ?? ''}
                editing={editing}
                onChange={onChangeName ?? (() => {})}
              />
            </Regular>
          </HStack>
          <FileDropTarget
            onDropFiles={(files) => {
              onChangeImage?.(files[0]);
            }}
          >
            {(isActive) => (
              <AspectRatio.Root ratio={1}>
                <VStack
                  position="absolute"
                  inset="0"
                  overflow="hidden"
                  alignItems="center"
                  justifyContent="center"
                  background="black"
                >
                  {resolvedImageUrl && (
                    <ImagePreview draggable="false" src={resolvedImageUrl} />
                  )}
                </VStack>
                {isActive && (
                  <VStack
                    position="absolute"
                    inset="0"
                    overflow="hidden"
                    background="green"
                    opacity={0.5}
                    pointerEvents="none"
                  />
                )}
              </AspectRatio.Root>
            )}
          </FileDropTarget>
          <Regular position="relative">
            <EditableTextArea
              placeholder="Description"
              value={
                (editing
                  ? metadata.description
                  : populatedMetadata.description) ?? ''
              }
              editing={editing}
              onChange={onChangeDescription ?? (() => {})}
            />
          </Regular>
        </VStack>
      </VStack>
      {(onOpen || isEditable) && (
        <>
          <HStack gap={8} padding={'8px 0'} justifyContent="end">
            {!editing && onOpen && (
              <Button onClick={onOpen}>
                <FileIcon />
                <SpacerHorizontal size={6} inline />
                <Label fontFamily="monospace" color="white">
                  Open
                </Label>
              </Button>
            )}
            {isEditable && (
              <Button
                onClick={() => {
                  setEditing(!editing);
                }}
              >
                <Pencil1Icon />
                <SpacerHorizontal size={6} inline />
                <Label fontFamily="monospace" color="white">
                  {editing ? 'Done' : 'Quick Edit'}
                </Label>
              </Button>
            )}
          </HStack>
        </>
      )}
    </VStack>
  );
}
