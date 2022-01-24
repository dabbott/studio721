import { GitHubLogoIcon } from '@radix-ui/react-icons';
import {
  DiscordLogoIcon,
  HStack,
  NavLink,
  SpacerHorizontal,
  TwitterLogoIcon,
  VStack,
} from 'components';
import {
  EnvironmentParameters,
  EnvironmentParametersProvider,
  Web3ContextProvider,
} from 'contexts';
import { DesignSystemConfigurationProvider } from 'designsystem/src/contexts/DesignSystemConfiguration';
import { castHashParameter, useUrlHashParameters } from 'hooks';
import { getCurrentPlatform } from 'keymap';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { theme } from 'theme';
import logoUrl from '../assets/studio721.svg';
import { Docs } from '../components/docs/Docs';
import '../styles/globals.css';

const docsUrlPrefix = '/guide';

const LogoImage = styled.img({
  width: 'auto',
  height: '20px',
});

export default function App({ Component, pageProps }: AppProps) {
  const urlHashParameters = useUrlHashParameters();

  const environmentParameters = useMemo(
    (): EnvironmentParameters => ({
      showDebugInfo: castHashParameter(
        urlHashParameters.showDebugInfo,
        'boolean',
      ),
      mockData: castHashParameter(urlHashParameters.mockData, 'boolean'),
    }),
    [urlHashParameters.mockData, urlHashParameters.showDebugInfo],
  );

  const { asPath: url } = useRouter();
  const showHeader = !url.startsWith('/mint');

  return (
    <EnvironmentParametersProvider value={environmentParameters}>
      <Web3ContextProvider>
        <DesignSystemConfigurationProvider
          theme={theme}
          platform={getCurrentPlatform(
            typeof navigator !== 'undefined' ? navigator : undefined,
          )}
        >
          {showHeader && (
            <>
              <HStack
                as="header"
                height="60px"
                justifyContent="center"
                breakpoints={{
                  [600]: {
                    justifyContent: 'start',
                  },
                }}
                position="fixed"
                zIndex={20000}
                background="#222"
                left={0}
                right={0}
                borderBottom={'1px solid rgba(0,0,0,0.4)'}
              >
                <HStack
                  flex="1 1 auto"
                  overflowX="auto"
                  overflowY="hidden"
                  paddingHorizontal={40}
                  breakpoints={{
                    [600]: {
                      paddingHorizontal: 20,
                    },
                  }}
                >
                  <HStack
                    gap={60}
                    breakpoints={{
                      [600]: {
                        gap: 30,
                      },
                    }}
                  >
                    <NavLink href="/">
                      <LogoImage src={logoUrl} />
                    </NavLink>
                    <NavLink href="/guide">Guide</NavLink>
                    <NavLink href="/artkit">Artkit</NavLink>
                    <NavLink href="/contract">Contract</NavLink>
                    <NavLink href="/mint">Mint</NavLink>
                  </HStack>
                  <SpacerHorizontal size={60} />
                  <SpacerHorizontal />
                  <HStack
                    gap={50}
                    breakpoints={{
                      [600]: {
                        gap: 30,
                      },
                    }}
                  >
                    <NavLink href="https://github.com/noya-app/studio721">
                      <GitHubLogoIcon width={22} height={22} />
                    </NavLink>
                    <NavLink href="https://twitter.com/dvnabbott">
                      <TwitterLogoIcon width={22} height={22} />
                    </NavLink>
                    <NavLink href="https://discord.gg/HWFNayQaDc">
                      <DiscordLogoIcon width={25} height={25} />
                    </NavLink>
                  </HStack>
                </HStack>
              </HStack>
            </>
          )}
          {url.startsWith(docsUrlPrefix) ? (
            <VStack id="guidebook-container" flex="1" margin={'60px 0 0 0'}>
              <Docs urlPrefix={docsUrlPrefix}>
                <Component {...pageProps} />
              </Docs>
            </VStack>
          ) : (
            <Component {...pageProps} />
          )}
        </DesignSystemConfigurationProvider>
      </Web3ContextProvider>
    </EnvironmentParametersProvider>
  );
}
