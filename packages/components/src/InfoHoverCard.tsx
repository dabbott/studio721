import { InfoCircledIcon } from '@radix-ui/react-icons';
import React, { memo, ReactNode } from 'react';
import { HoverCard } from 'components';

interface Props {
  children: ReactNode;
  top?: string;
}

export const InfoHoverCard = memo(function InfoHoverCard({
  children,
  top = '3px',
}: Props) {
  return (
    <HoverCard
      trigger={
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <InfoCircledIcon
            style={{
              position: 'relative',
              top,
            }}
            color="white"
          />
        </span>
      }
    >
      {children}
    </HoverCard>
  );
});
