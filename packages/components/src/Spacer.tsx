import React from 'react';
import { useMemo } from 'react';

interface Props {
  size?: number;
  inline?: boolean;
}

/* ----------------------------------------------------------------------------
 * Vertical
 * ------------------------------------------------------------------------- */

export const SpacerVertical = ({ size, inline }: Props) => {
  const Element = inline ? 'span' : 'div';

  const style = useMemo(
    () => ({
      display: inline ? 'inline-block' : 'block',
      ...(size === undefined
        ? { flex: 1 }
        : { minHeight: size, height: size, maxHeight: size }),
    }),
    [inline, size],
  );

  return <Element style={style} />;
};

// /* ----------------------------------------------------------------------------
//  * Horizontal
//  * ------------------------------------------------------------------------- */

export const SpacerHorizontal = ({ size, inline }: Props) => {
  const Element = inline ? 'span' : 'div';

  const style = useMemo(
    () => ({
      display: inline ? 'inline-block' : 'block',
      ...(size === undefined
        ? { flex: 1 }
        : { minWidth: size, width: size, maxWidth: size }),
    }),
    [inline, size],
  );

  return <Element style={style} />;
};
