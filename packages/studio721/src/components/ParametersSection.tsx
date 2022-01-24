import { PlusIcon } from '@radix-ui/react-icons';
import {
  HStack,
  Small,
  SpacerHorizontal,
  SpacerVertical,
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
import React, { memo, ReactNode, useCallback } from 'react';
import { Action, TokenParameter, TokenParameterType } from 'state';

export const ParameterRow = memo(function ParameterRow({
  id,
  name,
  type,
  disabled,
  onClickCross,
  onChangeName,
  onChangeType,
}: {
  id: string;
  name: string;
  type: TokenParameterType;
  disabled: boolean;
  onClickCross: () => void;
  onChangeName: (value: string) => void;
  onChangeType: (value: TokenParameterType) => void;
}) {
  return (
    <HStack alignItems="center" flex="1 1 0px">
      <IconButton iconName="DragHandleDots2Icon" />
      <SpacerHorizontal size={6} />
      <InputField.Root id={`${id}-name`} flex="1 1 0px">
        <InputField.Input
          disabled={disabled}
          value={name}
          onChange={onChangeName}
        />
      </InputField.Root>
      <SpacerHorizontal size={10} />
      <Select<TokenParameterType>
        id={`${id}-type`}
        disabled={disabled}
        value={type}
        options={['uint256', 'string', 'address']}
        onChange={onChangeType}
      />
      <SpacerHorizontal size={6} />
      <IconButton iconName="Cross2Icon" onClick={onClickCross} />
    </HStack>
  );
});

interface Props {
  parameters: TokenParameter[];
  disabled: boolean;
  dispatch: (action: Action) => void;
}

export const ParametersSection = memo(function ParametersSection({
  parameters,
  disabled,
  dispatch,
}: Props) {
  const handleMoveItem = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      dispatch({
        type: 'moveTokenParameter',
        sourceIndex,
        destinationIndex,
      });
    },
    [dispatch],
  );

  const handleRenderItem = useCallback(
    ({ item, index }: { item: TokenParameter; index: number }): ReactNode => {
      return (
        <ParameterRow
          id={`token-parameter-${index}`}
          key={index}
          type={item.type}
          name={item.name}
          disabled={disabled}
          onChangeName={(name) => {
            dispatch({ type: 'setTokenParameterName', index, name });
          }}
          onChangeType={(tokenType) => {
            dispatch({
              type: 'setTokenParameterType',
              index,
              tokenType,
            });
          }}
          onClickCross={() => {
            dispatch({ type: 'removeTokenParameter', index });
          }}
        />
      );
    },
    [disabled, dispatch],
  );

  return (
    <FormSection
      showContent={parameters.length > 0}
      title={
        <>
          Token Parameters{' '}
          <InfoHoverCard top="1px">
            Tokens may be minted with arbitrary parameters. These parameters are
            then accessible as query parameters of the <code>tokenURI</code>.
            <SpacerVertical size={20} />
            Note that for string parameters, it's your responsibility to
            url-encode them when minting; the <code>tokenURI</code> function
            does not url-encode parameters.
          </InfoHoverCard>
        </>
      }
      right={
        <Button
          disabled={disabled}
          onClick={useCallback(() => {
            dispatch({ type: 'addTokenParameter' });
          }, [dispatch])}
        >
          Add Parameter
          <SpacerHorizontal inline size={4} />
          <PlusIcon />
        </Button>
      }
    >
      <HStack>
        <HStack flex="1 1 0px" minWidth={0} padding={'0 0 0 21px'}>
          <Small>Name</Small>
        </HStack>
        <HStack flex="1 1 0px" minWidth={0} padding={'0 21px 0 0'}>
          <Small>Type</Small>
        </HStack>
        <SpacerHorizontal size={21} />
      </HStack>
      <ArrayController<TokenParameter>
        id={'token-parameter-controller'}
        sortable
        items={parameters}
        onMoveItem={handleMoveItem}
        renderItem={handleRenderItem}
      />
    </FormSection>
  );
});
