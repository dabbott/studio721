import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Anchor = styled.a({
  fontSize: '1rem',
  lineHeight: '60px',
  whiteSpace: 'pre',
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
});

export function NavLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  const router = useRouter();

  if (!href.startsWith('/')) {
    return (
      <Anchor href={href} target="_blank" rel="noreferrer">
        {children}
      </Anchor>
    );
  }

  return (
    <Link href={href} passHref>
      <Anchor
        className={
          router.asPath === href && router.asPath !== '/' ? 'active' : ''
        }
        style={{}}
      >
        {children}
      </Anchor>
    </Link>
  );
}
