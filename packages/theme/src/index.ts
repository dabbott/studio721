import { CSSObject } from 'styled-components';

export const breakpoints = {
  xsmall: 400,
  small: 600,
  medium: 800,
  large: 1080,
  xlarge: 1240,
} as const;

const typeScale = [3.052, 2.441, 1.953, 1.563, 1.25, 1, 0.85]; // Major third

export const theme = {
  sizes: {
    sidebarWidth: 260,
    toolbar: {
      height: 46,
      itemSeparator: 8,
    },
    inspector: {
      horizontalSeparator: 8,
      verticalSeparator: 10,
    },
    spacing: {
      nano: 2,
      micro: 4,
      small: 8,
      medium: 16,
      large: 32,
      xlarge: 64,
      xxlarge: 128,
    },
    dialog: {
      padding: 20,
    },
  },
  spacing: {
    gutterSmall: '20px',
    gutterLarge: '40px',
  },
  colors: {
    primary: '#8c7dfd',
    primaryMuted: 'rgba(140,125,253,0.41)',
    primaryLight: '#8461FF',
    background: '#222222',
    text: 'rgb(248,248,250)',
    textMuted: 'rgb(180,180,180)',
    textDisabled: 'rgb(100,100,100)',
    activeBackground: 'rgba(0,0,0,0.1)',
    // inputBackground: 'rgb(50,50,52)',
    inputBackground: 'rgba(255,255,255,0.05)',
    divider: 'rgba(255,255,255,0.08)',
    dividerStrong: 'rgba(0,0,0,1)',
    dragOutline: 'white',
    icon: 'rgb(139, 139, 139)',
    iconSelected: 'rgb(220, 220, 220)',
    scrollbar: 'rgba(199,199,199,0.2)',
    popover: {
      background: 'rgb(40,40,40)',
    },
    sidebar: {
      background: 'rgba(40,40,40,0.95)',
    },
    listView: {
      raisedBackground: 'rgba(0,0,0,0.03)',
    },
  },
  textStyles: {
    heading1: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.7,
    } as CSSObject,
    heading2: {
      fontSize: '1.2rem',
      fontWeight: 700,
      lineHeight: 1.5,
      color: '#ddd',
    } as CSSObject,
    heading3: {
      fontSize: '1.1rem',
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#ddd',
    } as CSSObject,
    body: {
      fontSize: '1.1rem',
      color: 'white',
      lineHeight: 1.65,
    } as CSSObject,
    label: {
      fontWeight: 600,
      fontSize: '0.9rem',
      color: '#ccc',
      lineHeight: 1.65,
    } as CSSObject,
    regular: {
      fontSize: `${typeScale[5]}rem`,
      fontWeight: 400,
      lineHeight: '1.75',
    } as CSSObject,
    small: {
      fontSize: `${typeScale[6]}rem`,
      fontWeight: 400,
      lineHeight: '1.4',
    } as CSSObject,
  },
} as const;

export type Theme = typeof theme;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
