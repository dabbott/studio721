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
import { Action, PayoutDestination } from 'state';

export const DestinationRow = memo(function DestinationRow({
  id,
  address,
  amount,
  disabled,
  onClickCross,
  onChangeAddress,
  onChangeAmount,
}: {
  id: string;
  address: Address;
  amount: number;
  disabled: boolean;
  onClickCross: () => void;
  onChangeAddress: (value: Address) => void;
  onChangeAmount: (value: number) => void;
}) {
  return (
    <HStack alignItems="center" flex="1 1 0px">
      <IconButton
        iconName="DragHandleDots2Icon"
        color={disabled ? 'transparent' : undefined}
      />
      <SpacerHorizontal size={6} />
      <InputField.Root id={`${id}-amount`} flex="1 1 0px" labelSize={12}>
        <InputField.NumberInput
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
              const newValue = amount + delta;

              if (newValue < 0 || newValue > 100) return;

              onChangeAmount(amount + delta);
            },
            [amount, onChangeAmount],
          )}
        />
        <InputField.Label>%</InputField.Label>
      </InputField.Root>
      <SpacerHorizontal size={10} />
      <InputField.Root id={`${id}-address`} flex="3 3 0px">
        <InputField.Input
          disabled={disabled}
          value={address}
          onChange={onChangeAddress as (value: string) => void}
        />
      </InputField.Root>
      <SpacerHorizontal size={6} />
      <IconButton
        iconName="Cross2Icon"
        color={disabled ? 'transparent' : undefined}
        onClick={onClickCross}
      />
    </HStack>
  );
});

interface Props {
  destinations: PayoutDestination[];
  disabled: boolean;
  dispatch: (action: Action) => void;
}

export const PayoutSection = memo(function PayoutSection({
  destinations,
  disabled,
  dispatch,
}: Props) {
  const handleMoveItem = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      dispatch({
        type: 'movePayoutDestination',
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
      item: PayoutDestination;
      index: number;
    }): ReactNode => {
      return (
        <DestinationRow
          id={`payout-destination-${index}`}
          key={index}
          address={item.address}
          amount={item.amount}
          disabled={disabled}
          onChangeAmount={(amount) => {
            if (amount === item.amount) return;

            dispatch({ type: 'setPayoutDestinationAmount', index, amount });
          }}
          onChangeAddress={(address) => {
            if (address === item.address) return;

            dispatch({
              type: 'setPayoutDestinationAddress',
              index,
              address,
            });
          }}
          onClickCross={() => {
            dispatch({ type: 'removePayoutDestination', index });
          }}
        />
      );
    },
    [disabled, dispatch],
  );

  const total = destinations
    .map((item) => item.amount)
    .reduce((result, item) => result + item, 0);

  return (
    <FormSection
      title={
        <>
          Payout{' '}
          <InfoHoverCard top="1px">
            Ether payed to the contract may be split and withdrawn to multiple
            addresses. This is only applicable if you set a price for your NFT.
          </InfoHoverCard>
        </>
      }
      right={
        <Button
          disabled={disabled}
          onClick={useCallback(() => {
            dispatch({ type: 'addPayoutDestination' });
          }, [dispatch])}
        >
          Add Recipient
          <SpacerHorizontal inline size={4} />
          <PlusIcon />
        </Button>
      }
    >
      <HStack gap={3}>
        <HStack flex="1 1 0px" minWidth={0} padding={'0 0 0 21px'}>
          <Small>Share</Small>
        </HStack>
        <HStack flex="3 3 0px" minWidth={0} padding={'0 0 0 0'}>
          <Small>Recipient Address</Small>
        </HStack>
      </HStack>
      <DestinationRow
        id={`payout-destination-owner`}
        address={'Contract Owner' as any}
        amount={total > 100 ? 0 : 100 - total}
        disabled={true}
        onChangeAmount={(amount) => {}}
        onChangeAddress={(address) => {}}
        onClickCross={() => {}}
      />
      <ArrayController<PayoutDestination>
        id={'payout-destination-controller'}
        sortable
        items={destinations}
        onMoveItem={handleMoveItem}
        renderItem={handleRenderItem}
      />
    </FormSection>
  );
});
