import React, { CSSProperties, useMemo } from 'react';

type Direction = 'up' | 'right' | 'down' | 'left';

interface Props {
  color: string;
  direction?: Direction;
  size?: number;
  strokeWidth?: number;
}

function getRotation(direction: Direction) {
  switch (direction) {
    case 'right':
      return 0;
    case 'down':
      return 90;
    case 'left':
      return 180;
    case 'up':
      return 270;
  }
}

export function Caret({
  color,
  direction = 'right',
  size = 14,
  strokeWidth = 2.5,
}: Props) {
  const style: CSSProperties = useMemo(
    () => ({
      width: `${size}px`,
      height: `${size}px`,
    }),
    [size],
  );

  return (
    <svg
      style={style}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      stroke={color}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        points="9,6 16,12 9,18"
        transform={`rotate(${getRotation(direction)} 12 12)`}
      />
    </svg>
  );
}
