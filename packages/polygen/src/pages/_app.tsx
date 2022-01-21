import { ConnectButton, HStack, NavLink, SpacerHorizontal } from 'components';
import { Web3ContextProvider } from 'contexts';
import { DesignSystemConfigurationProvider } from 'designsystem/src/contexts/DesignSystemConfiguration';
import { getCurrentPlatform } from 'keymap';
import type { AppProps } from 'next/app';
import React from 'react';
import { theme } from 'theme';
import { Grid } from '../components/Grid';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ContextProvider>
      <DesignSystemConfigurationProvider
        theme={theme}
        platform={getCurrentPlatform(
          typeof navigator !== 'undefined' ? navigator : undefined,
        )}
      >
        <Grid>
          <HStack
            as="header"
            height="60px"
            justifyContent="center"
            alignItems="center"
            paddingHorizontal="20px"
            background="white"
            borderBottom={'1px solid rgba(0,0,0,0.05)'}
          >
            <NavLink href="/">polygen.art</NavLink>
            <SpacerHorizontal />
            <ConnectButton />
          </HStack>
          <Component {...pageProps} />
        </Grid>
      </DesignSystemConfigurationProvider>
    </Web3ContextProvider>
  );
}
