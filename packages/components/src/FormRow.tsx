import { HStack, Small, SpacerHorizontal } from 'components';
import React, { memo, ReactNode } from 'react';
import { InfoHoverCard } from './InfoHoverCard';

interface Props {
  title: ReactNode;
  children: ReactNode;
  tooltip?: ReactNode;
  indent?: number;
  variant?: 'small' | 'medium' | 'regular';
}

export const FormRow = memo(function FormRow({
  title,
  children,
  tooltip,
  indent,
  variant = 'regular',
}: Props) {
  return (
    <HStack gap={10} alignItems="center" minHeight={27}>
      <HStack
        width={variant === 'small' ? 110 : variant === 'medium' ? 150 : 190}
      >
        {indent && <SpacerHorizontal size={indent * 20} />}
        <Small>
          {title}
          {tooltip && (
            <>
              <SpacerHorizontal inline size={6} />
              <InfoHoverCard>{tooltip}</InfoHoverCard>
            </>
          )}
        </Small>
      </HStack>
      {children}
    </HStack>
  );
});
