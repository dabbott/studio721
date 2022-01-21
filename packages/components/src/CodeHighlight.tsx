import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/vsDark';
import React, { ReactNode } from 'react';
import { Regular } from './Text';

export function Code({
  children,
  loading,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <Regular
      as="code"
      className={loading ? 'flickerAnimation' : undefined}
      fontSize="13px"
      fontWeight="bold"
      whiteSpace="pre-wrap"
      wordBreak="break-all"
      lineHeight="1.3"
    >
      {children}
    </Regular>
  );
}

interface Props {
  code: string;
  language: string;
}

export function CodeHighlight({ code, language }: Props) {
  return (
    <Code>
      <Highlight
        {...defaultProps}
        theme={theme}
        code={code}
        language={language as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </Code>
  );
}
