import { getHeadTags } from 'components';
import Head from 'next/head';
import React, { useEffect, useReducer } from 'react';
import { CollectionWelcome } from '../components/artkit/CollectionWelcome';
import { createInitialHistoryState, historyReducer } from 'state';
import { socialConfig } from '../utils/socialConfig';
import { FileSystemBrowser } from '../components/artkit/FileSystemBrowser';

export default function Collection() {
  useEffect(() => {
    // Disable native context menu on non-input element
    document.oncontextmenu = (event: MouseEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLAnchorElement
      )
        return;

      event.preventDefault();

      // This lets us open another context menu when one is currently open.
      // This may only be needed if the pointer is a pen.
      document.body.style.pointerEvents = '';
    };
  }, []);

  const initialState = createInitialHistoryState();

  const [historyState, dispatch] = useReducer(historyReducer, initialState);

  const state = historyState.present;

  return (
    <>
      <Head>
        <title>Studio 721</title>
        {getHeadTags({
          pageTitle: 'Studio 721 Artkit',
          pageDescription:
            'Create NFT artwork and metadata, and upload it to decentralized storage.',
          config: socialConfig,
        })}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.didInitialize ? (
        <FileSystemBrowser historyState={historyState} dispatch={dispatch} />
      ) : (
        <CollectionWelcome
          onInitialize={({ fileHandle, volume }) => {
            dispatch({ type: 'setFileHandle', fileHandle, volume });
          }}
        />
      )}
    </>
  );
}
