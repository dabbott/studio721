import React, { ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

export const Chip = styled.span({
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '4px',
  padding: '4px 6px',
  userSelect: 'none',
  fontSize: 'inherit',
});

export function LinkChip({
  children,
  href,
  style,
  openInNewTab,
}: {
  children: ReactNode;
  href?: string;
  style?: CSSObject;
  openInNewTab?: boolean;
}) {
  return (
    <Chip
      as="a"
      href={href}
      style={style}
      {...(openInNewTab && {
        target: '_blank',
        rel: 'noreferrer',
      })}
    >
      {children}
      {openInNewTab ? ' →' : ''}
    </Chip>
  );
}

export function TwitterChip({
  value,
  openInNewTab = true,
  hasMargin = true,
}: {
  value: string;
  openInNewTab?: boolean;
  hasMargin?: boolean;
}) {
  return (
    <LinkChip
      href={`https://twitter.com/${value.slice(1)}`}
      style={{ margin: hasMargin ? '0 2px 0 6px' : '0' }}
      openInNewTab={openInNewTab}
    >
      {value}
    </LinkChip>
  );
}
