import { memo } from 'react';

export const BackgroundFill = memo(function BackgroundFill({
  background,
}: {
  background: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        background,
      }}
    />
  );
});
