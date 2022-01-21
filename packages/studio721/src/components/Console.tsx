import { Divider, SpacerVertical, VStack } from 'components';
import React, { ReactNode, useEffect, useRef } from 'react';
import { withSeparatorElements } from 'utils';

export function Console({ elements }: { elements: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({
      top: 99999,
    });
  }, [elements]);

  return (
    <VStack
      ref={ref}
      overflowY="auto"
      flex="1 1 0px"
      padding={20}
      background="rgba(255,255,255,0.06)"
    >
      {withSeparatorElements(
        elements,
        <>
          <SpacerVertical size={20} />
          <Divider variant="light" />
          <SpacerVertical size={20} />
        </>,
      )}
    </VStack>
  );
}
