import { rgbaToHex } from '@openpalette/color';
import { parseCSSColor } from 'csscolorparser-ts';
import { Popover } from 'designsystem';
import React, { memo } from 'react';
import { HexColorPicker } from 'react-colorful';

export const ColorPicker = memo(function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (value: string) => void;
}) {
  const parsedColor = parseCSSColor(color);
  const hexColor = parsedColor
    ? rgbaToHex({
        r: parsedColor[0] / 255,
        g: parsedColor[1] / 255,
        b: parsedColor[2] / 255,
        a: 1,
      })
    : '#000000';

  return (
    <Popover
      trigger={
        <button
          style={{
            appearance: 'none',
            alignSelf: 'stretch',
            position: 'relative',
            margin: 0,
            padding: 0,
            borderRadius: '4px',
            overflow: 'hidden',
            width: '30px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            background: color,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.1) inset',
          }}
        />
      }
    >
      <HexColorPicker
        style={{
          width: 'auto',
          height: '200px',
        }}
        color={hexColor}
        onChange={(value) => {
          onChange(value);
        }}
      />
    </Popover>
  );
});
