import { MDXProvider } from '@mdx-js/react';
import { getHeadTags, VStack } from 'components';
import produce from 'immer';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode, useMemo } from 'react';
import {
  Anchor,
  defaultTheme,
  findNodeBySlug,
  guidebookStyled,
  GuidebookThemeProvider,
  LinkProps,
  LinkProvider,
  Page,
  PageComponents,
  RouterProvider,
} from 'react-guidebook';
import styled from 'styled-components';
import { theme } from 'theme';
import { isExternalUrl } from 'utils';
import guidebook from '../../../guidebook';
import { searchPages, searchTextMatch } from '../../utils/search';
import { socialConfig } from '../../utils/socialConfig';
import { JavascriptPlaygrounds } from 'artkit-browser/src/JavascriptPlaygrounds';
import { YouTube } from './YouTube';

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

export const docsTheme = produce(defaultTheme, (draft) => {
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

  draft.colors.starButton.icon = 'white';
  draft.colors.starButton.background = 'linear-gradient(to bottom, #444, #333)';
  draft.colors.starButton.divider = '#444';
  draft.colors.starButton.iconBackground.top = '#444';
  draft.colors.starButton.iconBackground.bottom = '#333';

  draft.colors.search.inputBackground = '#333';
  draft.colors.search.menuBackground = '#333';
  draft.colors.search.menuItemBackground = '#444';
  draft.colors.search.textHighlight = draft.colors.textDecorativeLight;

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

const ScrollableTableContainer = guidebookStyled.div({
  overflowX: 'auto',
  margin: '20px 0',
});

const StyledTable = guidebookStyled(PageComponents.table)({
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
  YouTube,
};

export function Docs({
  children,
  urlPrefix,
}: {
  children: ReactNode;
  urlPrefix: string;
}) {
  const router = useRouter();

  // Use `asPath`, since `pathname` will be "_error" if the page isn't found
  const pathname = router.pathname.slice(urlPrefix.length);
  const clientPath = router.asPath.slice(urlPrefix.length);

  const routerWithPrefix = useMemo(
    () => ({
      pathname,
      clientPath,
      push: (pathname: string) => {
        router.push(`${urlPrefix}${pathname}`);
      },
    }),
    [pathname, clientPath, router, urlPrefix],
  );

  const LinkComponent = useMemo(() => {
    return ({ href, children, style }: LinkProps) => (
      <Link
        href={
          isExternalUrl(href)
            ? href
            : href.startsWith('#')
            ? href
            : `${urlPrefix}${href}`
        }
        passHref
      >
        <Anchor style={style}>{children}</Anchor>
      </Link>
    );
  }, [urlPrefix]);

  const node = findNodeBySlug(guidebook, pathname.slice(1));

  return (
    <>
      <Head>
        <title>Studio 721 Docs</title>
        {getHeadTags({
          pageTitle: node?.title ?? 'Studio 721 Guide',
          pageDescription:
            node?.subtitle ??
            'Learn how NFTs work, and how to create your own collection.',
          config: socialConfig,
        })}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RouterProvider value={routerWithPrefix}>
        <LinkProvider value={LinkComponent}>
          {/* <Styles.Main /> */}
          <GuidebookThemeProvider theme={docsTheme}>
            {/* A single child is required here for React.Children.only */}
            <MDXProvider components={MDXComponents}>
              <Page
                rootNode={guidebook}
                searchPages={searchPages}
                searchTextMatch={searchTextMatch}
              >
                {children}
              </Page>
            </MDXProvider>
          </GuidebookThemeProvider>
        </LinkProvider>
      </RouterProvider>
    </>
  );
}
