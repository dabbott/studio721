import { Button as RainbowButton, Checkbox, HStack, VStack } from 'components';
import { InputField } from 'designsystem';
import { Volume } from 'imfs';
import React, { useMemo, useState } from 'react';
import { CollectionState } from 'state';
import { FormRow, FormRowError, FormSection } from 'components';

function validateSize(size: string) {
  const value = Number(size);
  const error = isNaN(value)
    ? 'Invalid number'
    : !Number.isInteger(value)
    ? 'Size must be a whole number'
    : value > 20000
    ? 'This max supported size for this tool is 20000'
    : null;

  return { value, error };
}

export function CollectionSizeTool({
  state,
  onSetSize,
}: {
  state: CollectionState;
  onSetSize: (options: { size: number; fileToDuplicate?: string }) => void;
}) {
  const initialTemplate = useMemo(() => {
    const children = Volume.readDirectory(state.volume, '/metadata');
    const tokenNumbers = children
      .map((name) => parseInt(name))
      .filter((value) => Number.isInteger(value));

    if (tokenNumbers.length > 0) {
      const largestTokenNumber = Math.max(...tokenNumbers);
      return `/metadata/${largestTokenNumber}.token.json`;
    } else {
      return '';
    }
  }, [state.volume]);
  const [templateFile, setTemplateFile] = useState<string>(initialTemplate);
  const [size, setSize] = useState('100');
  const [hasTemplate, setHasTemplate] = useState(!!initialTemplate);

  const { value: sizeValue, error: sizeError } = validateSize(size);

  return (
    <VStack gap={20} minWidth={'600px'}>
      <FormSection>
        <FormRow title="New Size">
          <InputField.Root>
            <InputField.Input value={size} onChange={setSize} />
          </InputField.Root>
        </FormRow>
        {sizeError && <FormRowError>{sizeError}</FormRowError>}
        <FormRow
          title="File To Duplicate"
          tooltip={
            <>
              When increasing the size of the collection, we'll create new token
              files. Check this to choose which file to duplicate to create the
              new files.
            </>
          }
        >
          <Checkbox
            variant="dark"
            checked={hasTemplate}
            onCheckedChange={setHasTemplate}
          />
          <InputField.Root>
            <InputField.Input
              disabled={!hasTemplate}
              value={templateFile}
              placeholder="Template file..."
              onChange={setTemplateFile}
            />
          </InputField.Root>
        </FormRow>
      </FormSection>
      <HStack justifyContent="end">
        <RainbowButton
          disabled={size === '' || !!sizeError}
          variant="header"
          onClick={() => {
            onSetSize({
              size: sizeValue,
              fileToDuplicate: hasTemplate ? templateFile : undefined,
            });
          }}
        >
          Update Collection
        </RainbowButton>
      </HStack>
    </VStack>
  );
}
