import React from 'react';
import {
  Children,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  memo,
  ReactHTML,
  ReactNode,
} from 'react';
import styled, { CSSObject } from 'styled-components';
import { BreakpointCollection, mergeBreakpoints } from 'utils';
import { withSeparatorElements } from 'utils';

interface StyleProps {
  display?: 'flex' | 'inline-flex' | 'none' | 'block';
  visibility?: CSSProperties['visibility'];
  position?: CSSProperties['position'];
  zIndex?: CSSProperties['zIndex'];
  gap?: CSSProperties['gap'];
  inset?: CSSProperties['inset'];
  top?: CSSProperties['top'];
  right?: CSSProperties['right'];
  bottom?: CSSProperties['bottom'];
  left?: CSSProperties['left'];
  flexDirection?: CSSProperties['flexDirection'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  alignSelf?: CSSProperties['alignSelf'];
  flex?: CSSProperties['flex'];
  flexWrap?: CSSProperties['flexWrap'];
  height?: CSSProperties['height'];
  minHeight?: CSSProperties['minHeight'];
  maxHeight?: CSSProperties['maxHeight'];
  width?: CSSProperties['width'];
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];
  padding?: CSSProperties['padding'];
  paddingVertical?: string | number;
  paddingHorizontal?: string | number;
  margin?: CSSProperties['margin'];
  background?: CSSProperties['background'];
  borderRadius?: CSSProperties['borderRadius'];
  overflowX?: CSSProperties['overflowX'];
  overflowY?: CSSProperties['overflowY'];
  overflow?: CSSProperties['overflow'];
  boxShadow?: CSSProperties['boxShadow'];
  outline?: CSSProperties['outline'];
  border?: CSSProperties['border'];
  borderTop?: CSSProperties['borderTop'];
  borderRight?: CSSProperties['borderRight'];
  borderBottom?: CSSProperties['borderBottom'];
  borderLeft?: CSSProperties['borderLeft'];
  cursor?: CSSProperties['cursor'];
  userSelect?: CSSProperties['userSelect'];
  transition?: CSSProperties['transition'];
  opacity?: CSSProperties['opacity'];
  filter?: CSSProperties['filter'];
  color?: CSSProperties['color'];
  order?: CSSProperties['order'];
  pointerEvents?: CSSProperties['pointerEvents'];
}

export type StackBreakpointList = BreakpointCollection<StyleProps>;

interface Props extends StyleProps {
  id?: string;
  as?: keyof ReactHTML;
  className?: string;
  children?: ReactNode;
  separator?: Parameters<typeof withSeparatorElements>[1];
  breakpoints?: StackBreakpointList | null | false;
  href?: string; // Shouldn't be here, ideally
}

function normalizeStyleProps({
  paddingVertical,
  paddingHorizontal,
  ...rest
}: StyleProps): CSSObject {
  return {
    ...(paddingVertical !== undefined && {
      paddingTop: paddingVertical,
      paddingBottom: paddingVertical,
    }),
    ...(paddingHorizontal !== undefined && {
      paddingLeft: paddingHorizontal,
      paddingRight: paddingHorizontal,
    }),
    ...rest,
  };
}

const Element = styled.div<{
  styleProps: StyleProps;
  breakpoints?: StackBreakpointList | null | false;
}>(({ styleProps, breakpoints }) => ({
  ...normalizeStyleProps(styleProps),
  ...mergeBreakpoints(breakpoints || [], normalizeStyleProps),
}));

const Stack = forwardRef(function Stack(
  { id, as, children, separator, breakpoints, href, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const elements = separator
    ? withSeparatorElements(Children.toArray(children), separator)
    : children;

  const styleProps: StyleProps = {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'stretch',
    ...rest,
  };

  return (
    <Element
      ref={forwardedRef}
      id={id}
      as={as}
      styleProps={styleProps}
      breakpoints={breakpoints}
      {...(href && { href })}
    >
      {elements}
    </Element>
  );
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface StackProps extends Omit<Props, 'separator' | 'flexDirection'> {}

export const VStack = memo(
  forwardRef(function VStack(
    props: StackProps,
    forwardedRef: ForwardedRef<HTMLElement>,
  ) {
    return <Stack {...props} flexDirection="column" ref={forwardedRef} />;
  }),
);

export const HStack = memo(
  forwardRef(function HStack(
    props: StackProps,
    forwardedRef: ForwardedRef<HTMLElement>,
  ) {
    return <Stack {...props} flexDirection="row" ref={forwardedRef} />;
  }),
);
