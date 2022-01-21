import React, {
  createContext,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import styled from 'styled-components';

const ItemContext = createContext<
  | {
      items: unknown[];
      columnCount: number;
      columnWidth: number;
      gap: number;
      gutter: number;
      renderItem: (options: { item: unknown; index: number }) => ReactNode;
    }
  | undefined
>(undefined);

const ContainerElement = styled.div({
  flex: '1 1 0%',
  position: 'relative',
});

const GridInnerElement = forwardRef(
  (
    { style, ...rest }: { style: CSSProperties },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const { gutter } = useContext(ItemContext)!;

    const computedStyle = useMemo(() => {
      return {
        ...style,
        height: Number(style.height ?? 0) + gutter * 2,
      };
    }, [style, gutter]);

    return <div ref={ref} style={computedStyle} {...rest} />;
  },
);

function Cell<T>({
  columnIndex,
  rowIndex,
  style,
}: {
  columnIndex: number;
  rowIndex: number;
  style: CSSProperties;
}) {
  const { items, columnCount, gap, gutter, renderItem } =
    useContext(ItemContext)!;

  const index = rowIndex * columnCount + columnIndex;
  const item = items[index] as T | undefined;

  if (!item) return null;

  const computedStyle = {
    ...style,
    top: Number(style.top) + gutter,
    left: Number(style.left) + gutter + columnIndex * gap,
  };

  return <div style={computedStyle}>{renderItem({ item, index })}</div>;
}

export function VirtualizedGrid<T>({
  items,
  size,
  renderItem,
  rowHeight,
  minimumItemWidth = 300,
  gap = 20,
  gutter = 20,
}: {
  items: T[];
  size: { width: number; height: number };
  renderItem: (options: { item: T; index: number }) => ReactNode;
  rowHeight: (width: number) => number;
  minimumItemWidth?: number;
  gap?: number;
  gutter?: number;
}) {
  const { width, height } = size;

  const widthMinusGutter = width - gutter * 2;
  const columnCount = Math.floor(widthMinusGutter / minimumItemWidth);
  const columnWidth = Math.floor(
    (widthMinusGutter - gap * (columnCount - 1)) / columnCount,
  );

  const contextValue = useMemo(() => {
    return {
      items,
      columnCount,
      columnWidth,
      gap,
      gutter,
      renderItem: renderItem as any,
    };
  }, [items, columnCount, columnWidth, gap, gutter, renderItem]);

  const grid = useMemo(() => {
    return (
      <ItemContext.Provider value={contextValue}>
        <Grid
          height={height}
          width={width}
          columnCount={contextValue.columnCount}
          columnWidth={contextValue.columnWidth}
          rowCount={Math.ceil(
            contextValue.items.length / contextValue.columnCount,
          )}
          rowHeight={rowHeight(contextValue.columnWidth)}
          innerElementType={GridInnerElement}
          overscanRowCount={10}
        >
          {Cell}
        </Grid>
      </ItemContext.Provider>
    );
  }, [contextValue, height, width, rowHeight]);

  return <ContainerElement>{width > 0 && grid}</ContainerElement>;
}
