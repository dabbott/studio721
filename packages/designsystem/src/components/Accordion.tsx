import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import React, { ForwardedRef, ReactNode } from 'react';
import styled from 'styled-components';

// const slideDown = keyframes({
//   from: { height: 0 },
//   to: { height: 'var(--radix-accordion-content-height)' },
// });

// const slideUp = keyframes({
//   from: { height: 'var(--radix-accordion-content-height)' },
//   to: { height: 0 },
// });

const StyledAccordion = styled(AccordionPrimitive.Root)(({ theme }) => ({
  borderRadius: 6,
  background: theme.colors.background,
  // background: theme.colors.inputBackground,
  // boxShadow: `0 2px 10px ${blackA.blackA4}`,
}));

const StyledItem = styled(AccordionPrimitive.Item)(({ theme }) => ({
  overflow: 'hidden',
  marginTop: 1,
  background: theme.colors.inputBackground,

  '&:first-child': {
    marginTop: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  '&:last-child': {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  '&:focus-within': {
    position: 'relative',
    zIndex: 1,
    // boxShadow: `0 0 0 2px ${mauve.mauve12}`,
  },
}));

const StyledHeader = styled(AccordionPrimitive.Header)({
  all: 'unset',
  display: 'flex',
});

const StyledTrigger = styled(AccordionPrimitive.Trigger)(({ theme }) => ({
  all: 'unset',
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
  padding: '8px 12px',
  // height: 32,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: 15,
  lineHeight: 1,
  color: theme.colors.text,
  // boxShadow: `0 1px 0 ${mauve.mauve6}`,
  // '&[data-state="closed"]': { backgroundColor: 'white' },
  // '&[data-state="open"]': { backgroundColor: 'white' },
  // '&:hover': { backgroundColor: mauve.mauve2 },
}));

const StyledContent = styled(AccordionPrimitive.Content)(({ theme }) => ({
  overflow: 'hidden',
  fontSize: 15,
  color: theme.colors.text,
  backgroundColor: theme.colors.activeBackground,

  // '&[data-state="open"]': {
  //   animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  // },
  // '&[data-state="closed"]': {
  //   animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  // },
}));

const StyledContentText = styled('div')({
  padding: '15px 20px',
});

const StyledChevron = styled(ChevronDownIcon)(({ theme }) => ({
  color: theme.colors.icon,
  // transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  // 'button[data-state=closed] &': { transform: 'rotate(0)' },
  'button[data-state=open] &': { transform: 'rotate(180deg)' },
}));

// Exports
export const Root = StyledAccordion;
export const Item = StyledItem;
export const Trigger = React.forwardRef(
  (
    {
      children,
      showsChevron = true,
      ...props
    }: { children: ReactNode; showsChevron?: boolean },
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => (
    <StyledHeader>
      <StyledTrigger {...props} ref={forwardedRef}>
        {children}
        {showsChevron && <StyledChevron aria-hidden />}
      </StyledTrigger>
    </StyledHeader>
  ),
);
export const Content = React.forwardRef(
  (
    { children, ...props }: { children: ReactNode },
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) => (
    <StyledContent {...props} ref={forwardedRef}>
      <StyledContentText>{children}</StyledContentText>
    </StyledContent>
  ),
);
