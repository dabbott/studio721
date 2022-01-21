import * as PopoverPrimitive from '@radix-ui/react-popover';
import React, { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';

const Content = styled(PopoverPrimitive.Content)<{
  width: CSSProperties['width'];
}>(({ theme, width = '240px' }) => ({
  width,
  borderRadius: 4,
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  maxHeight: '600px',
  overflow: 'hidden',
  color: theme.colors.textMuted,
}));

export function Popover({
  width,
  trigger,
  children,
}: {
  width?: CSSProperties['width'];
  trigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <Content side="bottom" align="center" width={width}>
        {children}
      </Content>
    </PopoverPrimitive.Root>
  );
}
