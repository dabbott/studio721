import { PlusIcon } from '@radix-ui/react-icons';
import {
  Checkbox,
  HStack,
  Small,
  SpacerHorizontal,
  FormSection,
  InfoHoverCard,
} from 'components';
import {
  ArrayController,
  Button,
  IconButton,
  InputField,
  Select,
} from 'designsystem';
import { castHashParameter } from 'hooks';
import React, { memo, ReactNode } from 'react';
import { CollectionAction, CollectionState } from 'state';
import { getMultiValue, groupBy } from 'utils';
import { NFTMetadataAttribute, NFTMetadataAttributeType } from 'web3-utils';

function getAttributeType(
  kind: string | number | boolean,
): NFTMetadataAttributeType {
  const type = typeof kind;

  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
      return type;
    default:
      return 'string';
  }
}

export const AttributeRow = memo(function AttributeRow({
  id,
  name,
  value,
  type,
  hasMultipleValue,
  hasMultipleTypes,
  onClickCross,
  onChangeName,
  onChangeValue,
  onChangeType,
}: {
  id: string;
  name: string;
  value: NFTMetadataAttribute['value'];
  type: NFTMetadataAttributeType;
  hasMultipleValue: boolean;
  hasMultipleTypes: boolean;
  onClickCross: () => void;
  onChangeName: (value: string) => void;
  onChangeValue: (value: NFTMetadataAttribute['value']) => void;
  onChangeType: (value: NFTMetadataAttributeType) => void;
}) {
  return (
    <HStack alignItems="center" flex="1 1 0px">
      <IconButton iconName="DragHandleDots2Icon" />
      <SpacerHorizontal size={6} />
      <InputField.Root id={`${id}-name`} flex="1 1 0px">
        <InputField.Input value={name} onChange={onChangeName} />
      </InputField.Root>
      <SpacerHorizontal size={10} />
      <HStack width={100}>
        <Select<NFTMetadataAttributeType | 'multiple'>
          id={`${id}-type`}
          value={hasMultipleTypes ? 'multiple' : type}
          options={[
            'string',
            'number',
            'boolean',
            ...(hasMultipleTypes ? ['multiple' as const] : []),
          ]}
          onChange={(type) => {
            if (type === 'multiple') return;

            onChangeType(type);
          }}
        />
      </HStack>
      <SpacerHorizontal size={10} />
      <HStack flex="1" alignItems="center">
        {typeof value === 'boolean' && (
          <Checkbox
            variant="dark"
            checked={value}
            onCheckedChange={onChangeValue}
          />
        )}
        {typeof value === 'number' && (
          <InputField.Root id={`${id}-amount`} flex="1 1 0px" labelSize={12}>
            <InputField.NumberInput
              autoComplete="no"
              value={value}
              onSubmit={onChangeValue}
              onNudge={(delta) => onChangeValue(value + delta)}
            />
          </InputField.Root>
        )}
        {typeof value === 'string' && (
          <InputField.Root id={`${id}-value-input`} flex="1">
            <InputField.Input
              value={value}
              onChange={onChangeValue}
              placeholder={
                hasMultipleValue ? 'Multiple Values' : 'Type a value...'
              }
            />
          </InputField.Root>
        )}
      </HStack>
      <SpacerHorizontal size={6} />
      <IconButton iconName="Cross2Icon" onClick={onClickCross} />
    </HStack>
  );
});

type EditableNFTMetadataAttribute = {
  trait_type: NFTMetadataAttribute['trait_type'];
  value?: NFTMetadataAttribute['value'];
  type?: NFTMetadataAttributeType;
};

export const AttributesInspector = memo(function AttributesInspector({
  state,
  dispatch,
  attributes,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
  attributes: NFTMetadataAttribute[][];
}) {
  const items = attributes.flat();
  const groupedAttributes = groupBy(items, (item) => item.trait_type);
  const mergedAttributes = Object.entries(groupedAttributes).map(
    ([name, attributes]): EditableNFTMetadataAttribute => {
      return {
        trait_type: name,
        value: getMultiValue(attributes.map((attribute) => attribute.value)),
        type: getMultiValue(
          attributes.map((attribute) => getAttributeType(attribute.value)),
        ),
      };
    },
  );

  const handleMoveItem = (sourceIndex: number, destinationIndex: number) => {
    dispatch({
      type: 'moveTokenMetadataAttribute',
      files: state.selectedFiles,
      attributeName: mergedAttributes[sourceIndex].trait_type,
      destinationIndex,
    });
  };

  const handleRenderItem = ({
    item,
    index,
  }: {
    item: EditableNFTMetadataAttribute;
    index: number;
  }): ReactNode => {
    return (
      <AttributeRow
        id={`token-parameter-${index}`}
        key={index}
        hasMultipleTypes={item.type === undefined}
        hasMultipleValue={item.value === undefined}
        type={item.type ?? 'string'}
        value={item.value ?? ''}
        name={item.trait_type}
        onChangeName={(name) => {
          dispatch({
            type: 'setTokenMetadataAttributeName',
            files: state.selectedFiles,
            originalAttributeName: item.trait_type,
            newAttributeName: name,
          });
        }}
        onChangeType={(tokenType) => {
          dispatch({
            type: 'setTokenMetadataAttributeValue',
            files: state.selectedFiles,
            attributeName: item.trait_type,
            attributeValue: castHashParameter(item.value ?? '', tokenType),
          });
        }}
        onChangeValue={(value) => {
          dispatch({
            type: 'setTokenMetadataAttributeValue',
            files: state.selectedFiles,
            attributeName: item.trait_type,
            attributeValue: value,
          });
        }}
        onClickCross={() => {
          dispatch({
            type: 'removeTokenMetadataAttribute',
            files: state.selectedFiles,
            attributeName: item.trait_type,
          });
        }}
      />
    );
  };

  return (
    <FormSection
      showContent={mergedAttributes.length > 0}
      title={
        <>
          Attributes{' '}
          <InfoHoverCard top="1px">
            Attributes, or traits, that can categorize the NFT and determine its
            rarity.
          </InfoHoverCard>
        </>
      }
      right={
        <Button
          onClick={() => {
            dispatch({
              type: 'addTokenMetadataAttribute',
              files: state.selectedFiles,
            });
          }}
        >
          Add Attribute
          <SpacerHorizontal inline size={4} />
          <PlusIcon />
        </Button>
      }
    >
      <HStack>
        <SpacerHorizontal size={21} />
        <HStack flex="1 1 0px" minWidth={0}>
          <Small>Name</Small>
        </HStack>
        <SpacerHorizontal size={10} />
        <HStack width="100px" minWidth={0}>
          <Small>Type</Small>
        </HStack>
        <SpacerHorizontal size={10} />
        <HStack flex="1 1 0px" minWidth={0}>
          <Small>Value</Small>
        </HStack>
        <SpacerHorizontal size={21} />
      </HStack>
      <ArrayController<EditableNFTMetadataAttribute>
        id={'token-parameter-controller'}
        sortable
        items={mergedAttributes}
        onMoveItem={handleMoveItem}
        renderItem={handleRenderItem}
      />
    </FormSection>
  );
});
