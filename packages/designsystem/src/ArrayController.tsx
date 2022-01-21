import { VStack } from 'components';
import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { range } from 'utils';
import * as ListView from './components/ListView';
import * as Sortable from './components/Sortable';
import { RelativeDropPosition } from './components/Sortable';

const ElementRow = styled.div({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const ItemContainer = styled.div({
  position: 'relative',
});

interface ArrayControllerProps<Item> {
  id: string;
  items: Item[];
  sortable?: boolean;
  reversed?: boolean;
  getKey?: (item: Item) => string;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
  renderItem: (props: { item: Item; index: number }) => ReactNode;
}

function ArrayControllerComponent<Item>({
  id,
  items,
  sortable = false,
  reversed = false,
  getKey,
  onMoveItem,
  renderItem,
}: ArrayControllerProps<Item>) {
  const keys = useMemo(
    () => items.map((item, index) => getKey?.(item) ?? index.toString()),
    [getKey, items],
  );

  const indexes = reversed
    ? range(0, items.length).reverse()
    : range(0, items.length);

  const handleMoveItem = useCallback(
    (
      sourceIndex: number,
      destinationIndex: number,
      position: RelativeDropPosition,
    ) => {
      if (reversed) {
        if (position === 'above') {
          position = 'below';
        } else if (position === 'below') {
          position = 'above';
        }
      }

      onMoveItem?.(
        sourceIndex,
        position === 'below' ? destinationIndex + 1 : destinationIndex,
      );
    },
    [onMoveItem, reversed],
  );

  const renderRow = (index: number) => {
    return (
      <ElementRow key={keys[index]}>
        {renderItem({ item: items[index], index: index })}
      </ElementRow>
    );
  };

  return (
    <VStack id={id} flex="0 0 auto" gap={10}>
      {sortable ? (
        <Sortable.Root
          keys={keys}
          renderOverlay={renderRow}
          onMoveItem={handleMoveItem}
        >
          {indexes.map((index) => (
            <Sortable.Item<HTMLDivElement> id={keys[index]} key={keys[index]}>
              {({ relativeDropPosition, ...sortableProps }) => (
                <ItemContainer {...sortableProps}>
                  {renderRow(index)}
                  {relativeDropPosition && (
                    <ListView.DragIndicatorElement
                      relativeDropPosition={relativeDropPosition}
                      offsetLeft={0}
                    />
                  )}
                </ItemContainer>
              )}
            </Sortable.Item>
          ))}
        </Sortable.Root>
      ) : (
        indexes.map(renderRow)
      )}
    </VStack>
  );
}

export const ArrayController = memo(ArrayControllerComponent);
