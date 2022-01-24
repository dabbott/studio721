import { Heading2, HStack, SpacerHorizontal, VStack } from 'components';
import React, { memo, ReactNode } from 'react';

interface Props {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  showContent?: boolean;
}

export const FormSection = memo(function FormSection({
  title,
  right,
  children,
  showContent = true,
}: Props) {
  return (
    <VStack gap={20}>
      {(title || right) && (
        <HStack>
          <Heading2>{title}</Heading2>
          {right && (
            <>
              <SpacerHorizontal />
              {right}
            </>
          )}
        </HStack>
      )}
      {showContent && (
        <VStack gap={8} padding={20} background="rgba(0,0,0,0.2)">
          {children}
        </VStack>
      )}
    </VStack>
  );
});
