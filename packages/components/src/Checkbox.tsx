import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import styled from 'styled-components';
import { CheckIcon } from '@radix-ui/react-icons';
import { ComponentProps } from 'react';
import React from 'react';

const StyledCheckbox = styled(CheckboxPrimitive.Root)<{
  variant: 'light' | 'dark';
}>(({ disabled, variant, theme }) => ({
  all: 'unset',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  width: 19,
  height: 19,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: disabled ? 0.5 : undefined,
  flex: '0 0 auto',
  ...(variant === 'dark'
    ? {
        backgroundColor: theme.colors.inputBackground,
      }
    : {
        backgroundColor: 'white',
      }),
  '&:hover': {
    boxShadow: 'none',
  },
  '&:focus': {
    // boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
}));

const StyledIndicator = styled(CheckboxPrimitive.Indicator)({
  color: '#7a6af7',
});

export function Checkbox({
  disabled,
  checked,
  onCheckedChange,
  variant = 'light',
}: Pick<
  ComponentProps<typeof StyledCheckbox>,
  'checked' | 'onCheckedChange'
> & { disabled?: boolean; variant?: 'light' | 'dark' }) {
  return (
    <StyledCheckbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      variant={variant}
    >
      <StyledIndicator>
        <CheckIcon
          width={20}
          height={20}
          style={{
            position: 'relative',
            top: '1px',
          }}
        />
      </StyledIndicator>
    </StyledCheckbox>
  );
}
