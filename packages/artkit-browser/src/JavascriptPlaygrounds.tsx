import { VStack } from 'components';
import { path } from 'imfs';
import Playground from 'javascript-playgrounds';
import { PublicOptions } from 'javascript-playgrounds/dist/src/utils/options';
import React from 'react';
import { useEffect } from 'react';
import { useTheme } from 'styled-components';

const workspaceCSS = `
/*
  Name:       material
  Author:     Mattia Astorino (http://github.com/equinusocio)
  Website:    https://material-theme.site/
*/

.cm-s-react.CodeMirror {
  background-color: #1c1c1c;
  color: #EEFFFF;
}

.cm-s-react .CodeMirror-gutters {
  background: #1c1c1c;
  color: #545454;
  border: none;
}

.cm-s-react .CodeMirror-guttermarker,
.cm-s-react .CodeMirror-guttermarker-subtle,
.cm-s-react .CodeMirror-linenumber {
  color: #545454;
}

.cm-s-react .CodeMirror-cursor {
  border-left: 1px solid #FFCC00;
}

.cm-s-react div.CodeMirror-selected {
  background: rgba(4, 116, 255, 0.35);
}

.cm-s-react.CodeMirror-focused div.CodeMirror-selected {
  background: rgba(4, 116, 255, 0.35);
}

.cm-s-react .CodeMirror-line::selection,
.cm-s-react .CodeMirror-line>span::selection,
.cm-s-react .CodeMirror-line>span>span::selection {
  background: rgba(128, 203, 196, 0.2);
}

.cm-s-react .CodeMirror-line::-moz-selection,
.cm-s-react .CodeMirror-line>span::-moz-selection,
.cm-s-react .CodeMirror-line>span>span::-moz-selection {
  background: rgba(128, 203, 196, 0.2);
}

.cm-s-react .CodeMirror-activeline-background {
  background: rgba(0, 0, 0, 0.5);
}

.cm-s-react span.cm-keyword {
  color: #C792EA;
}

.cm-s-react span.cm-operator {
  color: #89DDFF;
}

.cm-s-react span.cm-variable-2 {
  color: #EEFFFF;
}

.cm-s-react span.cm-variable-3,
.cm-s-react span.cm-type {
  color: #f07178;
}

.cm-s-react span.cm-builtin {
  color: #FFCB6B;
}

.cm-s-react span.cm-atom {
  color: #F78C6C;
}

.cm-s-react span.cm-number {
  color: #FF5370;
}

.cm-s-react span.cm-def {
  color: #82AAFF;
}

.cm-s-react span.cm-string {
  color: #C3E88D;
}

.cm-s-react span.cm-string-2 {
  color: #f07178;
}

.cm-s-react span.cm-comment {
  color: #545454;
}

.cm-s-react span.cm-variable {
  color: #f07178;
}

.cm-s-react span.cm-tag {
  color: #FF5370;
}

.cm-s-react span.cm-meta {
  color: #FFCB6B;
}

.cm-s-react span.cm-attribute {
  color: #C792EA;
}

.cm-s-react span.cm-property {
  color: #C792EA;
}

.cm-s-react span.cm-qualifier {
  color: #DECB6B;
}

.cm-s-react span.cm-variable-3,
.cm-s-react span.cm-type {
  color: #DECB6B;
}


.cm-s-react span.cm-error {
  color: rgba(255, 255, 255, 1.0);
  background-color: #FF5370;
}

.cm-s-react .CodeMirror-matchingbracket {
  text-decoration: underline;
  color: white !important;
}

.cm-s-react .cm-line-error {
  background-color: #740000;
}

@keyframes cm-line-warning {
  0% {
    background-color: #1c1c1c;
  }
  66% {
    background-color: #1c1c1c;
  }
  100% {
    background-color: #740000;
  }
}
`;

export function JavascriptPlaygrounds({
  entry,
  files,
  playerPane,
  onChangeFile,
}: {
  entry: string;
  files: Record<string, string>;
  /**
   * full:   render the full interactive iframe
   * hidden: render the interactive iframe with 0 width. This fixes a layout issue in the
   *         markdown docs where the gutter overlaps the code. I think this is due to how
   *         quickly it loads when it doesn't have to wait on the player. I'm not sure why
   *         it's OK in the fullscreen editor case though.
   * none:   don't render the player at all
   */
  playerPane: 'full' | 'hidden' | 'none';
  onChangeFile?: (name: string, value: string) => void;
}) {
  useEffect(() => {
    if (!onChangeFile) return;

    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://unpkg.com') return;

      const data: PublicOptions = JSON.parse(event.data);

      if (data.files) {
        Object.entries(data.files).forEach(([name, source]) => {
          if (files[name] === source) return;

          onChangeFile(name, source);
        });
      }
    };

    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  }, [files, onChangeFile]);

  const theme = useTheme();

  return (
    <VStack flex="1">
      <VStack position="relative" flex="1">
        <VStack
          position="absolute"
          inset="0"
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
          background="white"
        >
          <Playground
            targetOrigin="*"
            _css={workspaceCSS}
            preset="html"
            entry={entry}
            {...(playerPane === 'full' && Object.keys(files).length === 1
              ? { title: path.basename(entry) }
              : {})}
            files={files}
            reloadMode="hard"
            fullscreen
            compiler={{
              type: playerPane === 'full' ? 'babel' : 'none',
            }}
            playground={{
              enabled: false,
            }}
            panes={[
              'editor',
              ...(playerPane !== 'none'
                ? [
                    {
                      id: 'player',
                      type: 'player',
                      platform: 'web',
                      reloadable: true,
                      title: 'Live Preview',
                      style:
                        playerPane === 'hidden'
                          ? {
                              width: 0,
                            }
                          : {
                              flex: '1',
                            },
                      console: {
                        collapsible: true,
                        maximized: false,
                        renderReactElements: false,
                        showFileName: true,
                        showLineNumber: true,
                        visible: false,
                      },
                    } as const,
                  ]
                : []),
            ]}
            style={{
              width: '100%',
              height: '100%',
              background: '#1c1c1c',
            }}
            styles={{
              tab: {
                backgroundColor: '#1c1c1c',
              },
              header: {
                backgroundColor: '#1c1c1c',
              },
              playerHeader: {
                backgroundColor: '#1c1c1c',
              },
              tabTextActive: {
                borderBottom: `3px solid ${theme.colors.primary}`,
              },
              status: {
                ...(playerPane !== 'full' && { display: 'none' }),
                backgroundColor: '#1c1c1c',
                borderTop: '1px solid black',
                borderLeft: 'none',
              },
              consolePane: {
                backgroundColor: '#555',
                borderTop: '1px solid black',
                borderLeft: 'none',
              },
              consoleRow: {
                boxShadow: 'rgb(0, 0, 0, 25%) 0px -1px 0px 0px inset',
              },
            }}
          />
        </VStack>
      </VStack>
    </VStack>
  );
}
