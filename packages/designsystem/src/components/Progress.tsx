import * as ProgressPrimitive from '@radix-ui/react-progress';
import React from 'react';
import styled from 'styled-components';

const StyledProgress = styled(ProgressPrimitive.Root)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: theme.colors.inputBackground,
  borderRadius: '4px',
  height: 24,
}));

const StyledIndicator = styled(ProgressPrimitive.Indicator)(({ theme }) => ({
  backgroundColor: theme.colors.primary,
  height: '100%',
  transition: 'width 50ms cubic-bezier(0.65, 0, 0.35, 1)',
}));

export const Progress = ({ value }: { value: number }) => {
  const percent = Math.round(value * 100);

  return (
    <StyledProgress value={percent}>
      <StyledIndicator style={{ width: `${percent}%` }} />
    </StyledProgress>
  );
};
