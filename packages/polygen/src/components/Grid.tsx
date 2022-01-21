import * as React from 'react';
import styled, { CSSProp } from 'styled-components';

const gridBreakpoints = {
  small: '@media (min-width: 0px)',
  medium: '@media (min-width: 720px)',
  large: '@media (min-width: 1264px)',
};

type Breakpoints = keyof typeof gridBreakpoints;
type VariantStyles = Partial<Record<Breakpoints, CSSProp>>;

export const variant = ({ small, medium, large }: VariantStyles) => {
  const styles: Record<string, CSSProp> = {};
  if (small) {
    styles[gridBreakpoints.small] = small;
  }
  if (medium) {
    styles[gridBreakpoints.medium] = medium;
  }
  if (large) {
    styles[gridBreakpoints.large] = large;
  }
  return styles as CSSProp;
};

const StyledGrid = styled.div<{ debug?: boolean }>((props) => {
  let styles: CSSProp = {
    '--grid-margin': `16px`,
    '--grid-columns': `repeat(6, minmax(0, 1fr))`,
    [gridBreakpoints.medium]: {
      '--grid-margin': `minmax(32px, 1fr)`,
      '--grid-columns': `repeat(12, minmax(0, 1fr))`,
    },
    [gridBreakpoints.large]: {
      '--grid-columns': `repeat(12, 100px)`,
    },
    display: 'grid',
    gridTemplateColumns: `var(--grid-margin) var(--grid-columns) var(--grid-margin)`,
    minHeight: '100vh',
  };

  if (props.debug) {
    styles = {
      ...styles,
      backgroundSize: '100% 1rem',
      backgroundImage:
        'linear-gradient(to bottom, #25cef4 0px, transparent 1px)',
    };
  } else {
    styles = {
      ...styles,
      gridAutoRows: 'min-content',
      ['> *']: {
        gridColumn: '2/-2',
      },
    };
  }

  return styles;
});

function DebugGrid({ children }: { children: React.ReactNode }) {
  const [showGridDebug, setShowGridDebug] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'g') {
        setShowGridDebug((bool) => !bool);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div css={{ display: 'grid', '> *': { gridArea: '1 / 1 / 1 / 1' } }}>
      {children}
      <StyledGrid debug={showGridDebug} css={{ pointerEvents: 'none' }}>
        {Array(14)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              css={{
                background:
                  index === 0 || index === 13 ? '#ffc15012' : undefined,
                boxShadow: '0 0 0 1px #b6fcff6e',
                display: index <= 5 ? 'none' : 'block',
                [gridBreakpoints.medium]: {
                  display: 'block',
                },
              }}
            />
          ))}
      </StyledGrid>
    </div>
  );
}

export const Grid =
  process.env.NODE_ENV === 'production'
    ? StyledGrid
    : (props: React.ComponentProps<typeof StyledGrid>) => (
        <DebugGrid>
          <StyledGrid {...props} />
        </DebugGrid>
      );
