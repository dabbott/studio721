import { Address } from '@openpalette/contract';
import { PlusIcon } from '@radix-ui/react-icons';
import {
  HStack,
  Small,
  SpacerHorizontal,
  FormSection,
  InfoHoverCard,
} from 'components';
import { ArrayController, Button, IconButton, InputField } from 'designsystem';
import React, { memo, ReactNode, useCallback } from 'react';
import { AllowlistDestination, Action } from 'state';

export const DestinationRow = memo(function DestinationRow({
  id,
  address,
  amount,
  disabled,
  addressDisabled,
  onClickCross,
  onChangeAddress,
  onChangeAmount,
}: {
  id: string;
  address: Address;
  amount: number;
  disabled: boolean;
  addressDisabled?: boolean;
  onClickCross: () => void;
  onChangeAddress: (value: Address) => void;
  onChangeAmount: (value: number) => void;
}) {
  return (
    <HStack alignItems="center" flex="1 1 0px">
      <IconButton
        iconName="DragHandleDots2Icon"
        color={disabled || addressDisabled ? 'transparent' : undefined}
      />
      <SpacerHorizontal size={6} />
      <InputField.Root id={`${id}-amount`} flex="1 1 0px" labelSize={12}>
        <InputField.NumberInput
          autoComplete="no"
          disabled={disabled}
          value={amount}
          onSubmit={onChangeAmount}
          onChangeInternalValue={useCallback(
            (value) => {
              const numberValue = Number(value);

              if (
                !Number.isInteger(numberValue) ||
                numberValue < 0 ||
                numberValue > 100
              )
                return;

              onChangeAmount(numberValue);
            },
            [onChangeAmount],
          )}
          onNudge={useCallback(
            (delta) => {
              onChangeAmount(Math.max(0, Math.min(100, amount + delta)));
            },
            [amount, onChangeAmount],
          )}
        />
      </InputField.Root>
      <SpacerHorizontal size={10} />
      <InputField.Root id={`${id}-address`} flex="3 3 0px">
        <InputField.Input
          disabled={disabled || addressDisabled}
          value={address}
          onChange={onChangeAddress as (value: string) => void}
        />
      </InputField.Root>
      <SpacerHorizontal size={6} />
      <IconButton
        iconName="Cross2Icon"
        color={addressDisabled || disabled ? 'transparent' : undefined}
        onClick={onClickCross}
      />
    </HStack>
  );
});

interface Props {
  destinations: AllowlistDestination[];
  allowedForOwner: number;
  disabled: boolean;
  dispatch: (action: Action) => void;
}

export const AllowlistSection = memo(function AllowlistSection({
  allowedForOwner,
  destinations,
  disabled,
  dispatch,
}: Props) {
  const handleMoveItem = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      dispatch({
        type: 'moveAllowlistDestination',
        sourceIndex,
        destinationIndex,
      });
    },
    [dispatch],
  );

  const handleRenderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: AllowlistDestination;
      index: number;
    }): ReactNode => {
      return (
        <DestinationRow
          id={`allowlist-destination-${index}`}
          key={index}
          address={item.address}
          amount={item.amount}
          disabled={disabled}
          onChangeAmount={(amount) => {
            if (amount === item.amount) return;

            dispatch({ type: 'setAllowlistDestinationAmount', index, amount });
          }}
          onChangeAddress={(address) => {
            if (address === item.address) return;

            dispatch({
              type: 'setAllowlistDestinationAddress',
              index,
              address,
            });
          }}
          onClickCross={() => {
            dispatch({ type: 'removeAllowlistDestination', index });
          }}
        />
      );
    },
    [disabled, dispatch],
  );

  return (
    <FormSection
      title={
        <>
          Allowlist{' '}
          <InfoHoverCard top="1px">
            Addresses allowed to mint, and how many they can mint, before the
            sale starts.
          </InfoHoverCard>
        </>
      }
      right={
        <Button
          disabled={disabled}
          onClick={useCallback(() => {
            dispatch({ type: 'addAllowlistDestination' });
          }, [dispatch])}
        >
          Add Address
          <SpacerHorizontal inline size={4} />
          <PlusIcon />
        </Button>
      }
    >
      <HStack gap={3}>
        <HStack flex="1 1 0px" minWidth={0} padding={'0 0 0 21px'}>
          <Small>Amount</Small>
        </HStack>
        <HStack flex="3 3 0px" minWidth={0} padding={'0 0 0 0'}>
          <Small>Allowed Address</Small>
        </HStack>
      </HStack>
      <DestinationRow
        id={`allowlist-destination-owner`}
        address={'Contract Owner' as any}
        amount={allowedForOwner}
        disabled={disabled}
        addressDisabled={true}
        onChangeAmount={(amount) => {
          if (amount === allowedForOwner) return;

          dispatch({ type: 'setAmountAllowedForOwner', amount });
        }}
        onChangeAddress={(address) => {}}
        onClickCross={() => {}}
      />
      <ArrayController<AllowlistDestination>
        id={'allowlist-destination-controller'}
        sortable
        items={destinations}
        onMoveItem={handleMoveItem}
        renderItem={handleRenderItem}
      />
    </FormSection>
  );
});
