import { HStack, Small } from 'components';
import React from 'react';
import { ReactNode } from 'react';

export function FormRowError({ children }: { children: ReactNode }) {
  return (
    <HStack justifyContent="flex-end">
      <Small color="red" flex="0 0 auto">
        {children}
      </Small>
    </HStack>
  );
}
