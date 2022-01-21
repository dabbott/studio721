import React, { ComponentProps, ReactNode } from 'react';
import { memo } from 'react';
import { VStack } from '.';

export const ScrollableStack = memo(function ScrollableStack({
  children,
  outerProps,
  innerProps,
}: {
  children: ReactNode;
  outerProps?: ComponentProps<typeof VStack>;
  innerProps?: ComponentProps<typeof VStack>;
}) {
  return (
    <VStack flex="1 1 0px" {...outerProps}>
      <VStack overflowY="auto" flex="1 1 0px" {...innerProps}>
        {children}
      </VStack>
    </VStack>
  );
});
