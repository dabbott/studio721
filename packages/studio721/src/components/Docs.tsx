import Head from 'next/head';
import { MDXProvider } from '@mdx-js/react';
import { getHeadTags, VStack } from 'components';
import produce from 'immer';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode, useMemo } from 'react';
import {
  Anchor,
  defaultTheme,
  LinkProps,
  LinkProvider,
  Page,
  PageComponents,
  RouterProvider,
  findNodeBySlug,
} from 'react-guidebook';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from 'theme';
import { isExternalUrl } from 'utils';
import guidebook from '../../guidebook';
import { JavascriptPlaygrounds } from './JavascriptPlaygrounds';
import { socialConfig } from '../utils/socialConfig';

export function StatelessCodeView({
  filename,
  code,
  height,
}: {
  filename: string;
  code: string;
  height: number;
}) {
  return (
    <div
      style={{
        margin: '20px 0',
        minHeight: `${height}px`,
        display: 'flex',
        position: 'relative',
      }}
    >
      <VStack position="absolute" height={height} inset={0}>
        <JavascriptPlaygrounds
          entry={filename}
          files={useMemo(() => ({ [filename]: code }), [code, filename])}
          playerPane="hidden"
        />
      </VStack>
    </div>
  );
}

const docsTheme = produce(defaultTheme, (draft) => {
  draft.sizes.inset.top = 60;

  draft.colors.background = '#222';
  draft.colors.text = '#fff';
  draft.colors.textMuted = '#eee';
  draft.colors.divider = '#333';
  draft.colors.neutralBackground = '#444';
  draft.colors.textDecorativeLight = '#48b3f3c7';
  draft.colors.selectedBackground = '#3969ef42';
  // draft.colors.textDecorativeLight = '#ffe8fa';
  // draft.colors.selectedBackground = '#ff08d526';
  draft.colors.textLink = theme.colors.primary;
  draft.colors.textLinkFocused = theme.colors.primaryLight;
  draft.colors.inlineCode.text = '#23ff86';

  draft.colors.primary = theme.colors.primary;
  draft.colors.title.left = '#808DFF';
  draft.colors.title.right = '#8461FF';

  draft.colors.button.primaryBackground = theme.colors.primary;
  draft.colors.button.secondaryBackground = '#444';
  draft.colors.codeBackgroundLight = 'rgba(140, 125, 253, 0.25)';
  draft.colors.neutralBackground = 'rgba(140, 125, 253, 0.25)';

  draft.textStyles.body.color = draft.colors.text;
  draft.textStyles.heading1.color = draft.colors.text;
  draft.textStyles.heading2.color = draft.colors.text;
  draft.textStyles.heading3.color = draft.colors.text;
  draft.textStyles.title.color = draft.colors.text;
  draft.textStyles.subtitle.color = draft.colors.text;
  draft.textStyles.small.color = draft.colors.text;
  draft.textStyles.code.color = draft.colors.text;

  draft.textStyles.sidebar.title.color = draft.colors.text;
  draft.textStyles.sidebar.title.fontWeight = 500;
  draft.textStyles.sidebar.row.color = draft.colors.textMuted;
  draft.textStyles.sidebar.row.fontWeight = 500;
  draft.textStyles.sidebar.rowSmall.color = draft.colors.textMuted;
  draft.textStyles.sidebar.rowSmall.fontWeight = 500;
});

const StyledAnchor = styled(PageComponents.a)({
  // Prevent long lines from overflowing and resizing the page on mobile
  lineBreak: 'anywhere',
});

const ScrollableTableContainer = styled.div({
  overflowX: 'auto',
  margin: '20px 0',
});

const StyledTable = styled(PageComponents.table)({
  background: '#1c1c1c',
  marginBottom: 0,
});

const MDXComponents = {
  ...PageComponents,
  a: StyledAnchor,
  table: (props: React.ComponentProps<typeof PageComponents['table']>) => (
    <ScrollableTableContainer>
      <StyledTable {...props} />
    </ScrollableTableContainer>
  ),
  Editor: StatelessCodeView,
};

export function Docs({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Use `asPath`, since `pathname` will be "_error" if the page isn't found
  const prefix = '/docs';
  const pathname = router.pathname.slice(prefix.length);
  const clientPath = router.asPath.slice(prefix.length);

  const routerWithPrefix = useMemo(
    () => ({
      pathname,
      clientPath,
      push: (pathname: string) => {
        router.push(`${prefix}${pathname}`);
      },
    }),
    [pathname, clientPath, router],
  );

  const LinkComponent = useMemo(() => {
    return ({ href, children, style }: LinkProps) => (
      <Link
        href={
          isExternalUrl(href)
            ? href
            : href.startsWith('#')
            ? href
            : `${prefix}${href}`
        }
        passHref
      >
        <Anchor style={style}>{children}</Anchor>
      </Link>
    );
  }, [prefix]);

  const node = findNodeBySlug(guidebook, pathname.slice(1));

  return (
    <>
      <Head>
        <title>Studio 721 Docs</title>
        {getHeadTags({
          pageTitle: node?.title ?? 'Studio 721 Docs',
          pageDescription:
            node?.subtitle ??
            'Everything you need to know to start creating NFTs.',
          config: socialConfig,
        })}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RouterProvider value={routerWithPrefix}>
        <LinkProvider value={LinkComponent}>
          {/* <Styles.Main /> */}
          <ThemeProvider theme={docsTheme as any}>
            {/* A single child is required here for React.Children.only */}
            <MDXProvider components={MDXComponents}>
              <Page rootNode={guidebook}>{children}</Page>
            </MDXProvider>
          </ThemeProvider>
        </LinkProvider>
      </RouterProvider>
    </>
  );
}
