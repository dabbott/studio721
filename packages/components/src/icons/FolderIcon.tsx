import type { IconProps } from '@radix-ui/react-icons/dist/types';
import React from 'react';
import { memo } from 'react';

export const FolderIcon = memo(function ({
  color = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...(props as any)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 3C2.22386 3 2 3.22386 2 3.5V6.5V11.5C2 11.7761 2.22386 12 2.5 12H12.5C12.7761 12 13 11.7761 13 11.5V4H10H6.80278C6.50664 4 6.21713 3.91234 5.97073 3.74808L4.97457 3.08397C4.89244 3.02922 4.79594 3 4.69722 3H2.5ZM1 3.5C1 2.67157 1.67157 2 2.5 2H4.69722C4.99336 2 5.28287 2.08766 5.52927 2.25192L6.52543 2.91603C6.60756 2.97078 6.70406 3 6.80278 3H10H13.25C13.6642 3 14 3.33579 14 3.75V11.5C14 12.3284 13.3284 13 12.5 13H2.5C1.67157 13 1 12.3284 1 11.5V6.5V3.5Z"
        fill={color}
      />
      <line x1="2" y1="5.5" x2="13" y2="5.5" stroke={color} />
    </svg>
  );
});
