import { VStack } from 'components';
import { Node } from 'imfs';
import { FileData } from 'files';
import { ImagePreview, useTokenImageUrl } from '../browser/TokenCard';
import React from 'react';

export function ImageInspector({
  filename,
  volume,
}: {
  filename: string;
  volume: Node<FileData>;
}) {
  const absolute = `/${filename}`;
  const resolvedImageUrl = useTokenImageUrl(volume, absolute);

  return (
    <VStack position="relative" flex="1">
      <VStack
        position="absolute"
        inset="0"
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        background="black"
      >
        {resolvedImageUrl && (
          <ImagePreview key={absolute} src={resolvedImageUrl} />
        )}
      </VStack>
    </VStack>
  );
}
