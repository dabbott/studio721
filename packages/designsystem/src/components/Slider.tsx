import React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

const StyledSlider = styled(RadixSlider.Root)({
  flex: '1',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  height: '16px',
});

const StyledTrack = styled(RadixSlider.Track)(({ theme }) => ({
  backgroundColor: theme.colors.divider,
  position: 'relative',
  flexGrow: 1,
  height: '16px',
}));

const StyledRange = styled(RadixSlider.Range)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: theme.colors.primary,
  // borderRadius: '9999px',
  height: '100%',
}));

const StyledThumb = styled(RadixSlider.Thumb)(({ theme }) => ({
  display: 'block',
  width: '16px',
  height: '16px',
  backgroundColor: 'white',
  // borderRadius: '20px',
  '&:hover': { backgroundColor: '#ddd' },
  '&:focus': {
    outline: 'none',
    border: `2px solid ${theme.colors.primary}`,
    boxShadow: '0 0 0 2px white',
  },
}));

interface Props {
  id?: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
}

export function Slider({ id, value, onValueChange, min, max }: Props) {
  const arrayValue = useMemo(
    () => [Math.min(Math.max(value, min), max)],
    [value, min, max],
  );

  const handleValueChange = useCallback(
    (arrayValue: number[]) => {
      onValueChange(arrayValue[0]);
    },
    [onValueChange],
  );

  return (
    <StyledSlider
      min={min}
      max={max}
      id={id}
      value={arrayValue}
      onValueChange={handleValueChange}
    >
      <StyledTrack>
        <StyledRange />
      </StyledTrack>
      <StyledThumb />
    </StyledSlider>
  );
}
