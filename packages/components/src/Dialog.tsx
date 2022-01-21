import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from 'react';
import styled from 'styled-components';
import { Divider } from './Divider';
import { SpacerVertical } from './Spacer';

const StyledOverlay = styled(DialogPrimitive.Overlay)({
  backgroundColor: 'rgba(0,0,0,0.5)',
  position: 'fixed',
  inset: 0,
});

const StyledContent = styled(DialogPrimitive.Content)(({ theme }) => ({
  // boxShadow:
  //   'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  boxShadow: [
    '1.3px 1.6px 2.2px rgba(0, 0, 0, 0.031)',
    '3.2px 3.9px 5.3px rgba(0, 0, 0, 0.044)',
    '6px 7.3px 10px rgba(0, 0, 0, 0.055)',
    '10.7px 13px 17.9px rgba(0, 0, 0, 0.066)',
    '20.1px 24.2px 33.4px rgba(0, 0, 0, 0.079)',
    '48px 58px 80px rgba(0, 0, 0, 0.11)',
  ].join(', '),
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // width: "90vw",
  // maxWidth: "450px",
  // maxHeight: "85vh",
  maxWidth: '90vw',
  maxHeight: '90vh',
  padding: theme.spacing.gutterSmall,
  borderRadius: 4,
  border: `1px solid ${theme.colors.divider}`,
  ...theme.textStyles.body,
  backgroundColor: theme.colors.background,
  overflowY: 'auto',
  // color: theme.colors.textMuted,
  '&:focus': { outline: 'none' },
}));

const StyledTitle = styled(DialogPrimitive.Title)(({ theme }) => ({
  margin: 0,
  ...theme.textStyles.heading2,
  // color: theme.colors.text,
}));

const StyledDescription = styled(DialogPrimitive.Description)(({ theme }) => ({
  margin: 0,
  ...theme.textStyles.label,
  // color: theme.colors.textMuted,
}));

const CloseButtonContainer = styled.div(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing.gutterSmall,
  right: theme.spacing.gutterSmall,
}));

export interface IDialog {
  containsElement: (element: HTMLElement) => boolean;
}

interface Props {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  open?: ComponentProps<typeof DialogPrimitive.Root>['open'];
  onOpenChange?: ComponentProps<typeof DialogPrimitive.Root>['onOpenChange'];
  onOpenAutoFocus?: ComponentProps<
    typeof DialogPrimitive.Content
  >['onOpenAutoFocus'];
}

export const Dialog = forwardRef(function Dialog(
  { children, title, description, open, onOpenChange, onOpenAutoFocus }: Props,
  forwardedRef: ForwardedRef<IDialog>,
) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <StyledOverlay />
      <StyledContent onOpenAutoFocus={onOpenAutoFocus}>
        <CloseButtonContainer>
          <DialogPrimitive.Close
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              background: 'none',
            }}
          >
            <Cross1Icon color="white" />
          </DialogPrimitive.Close>
        </CloseButtonContainer>
        {title && (
          <>
            <StyledTitle>{title}</StyledTitle>
            <SpacerVertical size={description ? 10 : 20} />
          </>
        )}
        {description && (
          <>
            <SpacerVertical size={10} />
            <StyledDescription>{description}</StyledDescription>
            <SpacerVertical size={20} />
          </>
        )}
        {(title || description) && (
          <>
            <Divider variant="light" />
            <SpacerVertical size={20} />
          </>
        )}
        {children}
      </StyledContent>
    </DialogPrimitive.Root>
  );
});
