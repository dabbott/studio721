import {
  Button as RainbowButton,
  Divider,
  HStack,
  Small,
  SpacerVertical,
  VStack,
} from 'components';
import { Progress, Select } from 'designsystem';
import { path } from 'imfs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CollectionState } from 'state';
import {
  ArtkitGeneratedMetadata,
  generateTokensFromWebsite,
} from 'artkit-capture';
import { getEntryFile, ImagePreview } from 'artkit-browser';
import { findAllTokenFiles } from 'artkit-collection';
import { fileDataToBytes } from 'files';
import { FormRow, FormSection, InfoHoverCard } from 'components';

type TokensCategory = 'referenced' | 'all';

export function GenerateMetadataTool({
  state,
  onGenerate,
}: {
  state: CollectionState;
  onGenerate: (options: ArtkitGeneratedMetadata) => void;
}) {
  const [tokensCategory, setTokensCategory] = useState<TokensCategory>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quickPreviewFile, setQuickPreviewFile] = useState<
    string | undefined
  >();
  const [previewImage, setPreviewImage] = useState<Uint8Array>();
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>();
  const cancelGeneration = useRef(() => {});

  const entry = getEntryFile(state.volume, state.selectedFiles[0]);

  const entries = useMemo(() => {
    if (!entry) return [];

    return findAllTokenFiles(state.volume, (_name, metadata) => {
      switch (tokensCategory) {
        case 'all':
          return true;
        case 'referenced':
          return (
            !!metadata.animation_url && metadata.animation_url.startsWith(entry)
          );
      }
    });
  }, [entry, state.volume, tokensCategory]);

  useEffect(() => {
    if (previewImage) {
      const url = URL.createObjectURL(new Blob([previewImage]));

      setResolvedImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setResolvedImageUrl('');
    }
  }, [previewImage]);

  useEffect(() => {
    async function main() {
      if (!entry || entries.length === 0) return;

      const file = quickPreviewFile || entries[0][0];

      setPreviewImage(undefined);

      cancelGeneration.current();

      const handle = generateTokensFromWebsite(
        state.volume,
        entries.filter((entry) => entry[0] === file),
        entry,
        ({ current, total }) => {
          setProgress(current / total);
        },
      );

      cancelGeneration.current = handle.cancel;

      const generated = await handle.generated;

      if (!generated) return;

      const image = generated[file].image;

      if (!image || image[1].type !== 'file') return;

      setPreviewImage(fileDataToBytes(image[1].data));
    }

    main();
  }, [state.volume, entry, entries, quickPreviewFile]);

  if (!entry) return <></>;

  return (
    <VStack gap={20} maxWidth={'600px'}>
      <HStack gap={20}>
        <VStack flex="1" gap={20}>
          <Small>
            This tool automatically generates images and attributes for each{' '}
            <code>.token.json</code> file in your project.{' '}
            <InfoHoverCard>
              <Small>
                How it works: we bundle your code files into a single{' '}
                <code>html</code> string and load it into an <code>iframe</code>
                . We then wait for your code to call{' '}
                <code>{'artkit.saveMetadata({ ... })'}</code>, and store the
                result.
              </Small>
              <SpacerVertical size={20} />
              <Small>
                There are some limitations with this approach, e.g. you won't be
                able to create images that contain cross-origin assets.
              </Small>
              <SpacerVertical size={20} />
              <Small>
                This tool is optional - you can also generate your image
                previews using other techniques. E.g. downloading the zip and
                adding the files yourself, or set the image url to a server that
                runs headless Chrome.
              </Small>
            </InfoHoverCard>
          </Small>
          <FormSection>
            <FormRow variant="small" title="Generate for">
              <Select<TokensCategory>
                id="input-preset"
                disabled={isGenerating}
                value={tokensCategory}
                options={['all', 'referenced']}
                getTitle={(id) => {
                  switch (id) {
                    case 'all':
                      return 'All token files';
                    case 'referenced':
                      return 'Token files with this html file as the animation_url';
                  }
                }}
                onChange={setTokensCategory}
              />
            </FormRow>
          </FormSection>
        </VStack>
        <VStack
          gap={8}
          padding={10}
          background="rgba(0,0,0,0.2)"
          borderRadius="4px"
        >
          <Small fontWeight={500}>Quick Preview</Small>
          <VStack height={200} width={200}>
            <VStack
              position="absolute"
              inset="0"
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
              background="black"
              opacity={isGenerating ? 0.5 : 1}
            >
              {resolvedImageUrl && (
                <ImagePreview draggable="false" src={resolvedImageUrl} />
              )}
              <HStack
                position="absolute"
                top="10px"
                left="10px"
                right="10px"
                background="#222"
                borderRadius="4px"
              >
                {entries.length > 0 && (
                  <Select
                    flex="1"
                    disabled={isGenerating}
                    id="quick-preview-file"
                    value={quickPreviewFile ?? entries[0][0]}
                    options={entries.map(([name]) => name)}
                    getTitle={(name) => path.basename(name)}
                    onChange={setQuickPreviewFile}
                  />
                )}
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
      <Divider variant="light" />
      {isGenerating ? (
        <>
          <Progress value={progress} />
          <HStack justifyContent="end">
            <RainbowButton
              variant="header"
              onClick={async () => {
                cancelGeneration.current();
              }}
            >
              Abort
            </RainbowButton>
          </HStack>
        </>
      ) : (
        <HStack justifyContent="end" gap="20px">
          <RainbowButton
            disabled={isGenerating}
            variant="header"
            onClick={async () => {
              cancelGeneration.current();

              setIsGenerating(true);
              setProgress(0);

              const handle = generateTokensFromWebsite(
                state.volume,
                entries,
                entry,
                ({ current, total }) => {
                  setProgress(current / total);
                },
              );

              cancelGeneration.current = handle.cancel;

              const generated = await handle.generated;

              setIsGenerating(false);

              if (generated) {
                onGenerate(generated);
              }
            }}
          >
            Generate for {entries.length} tokens
          </RainbowButton>
        </HStack>
      )}
    </VStack>
  );
}
