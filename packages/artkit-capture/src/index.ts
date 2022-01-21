import {
  ArtkitMessageToHost,
  Message,
  MetadataAttributes,
} from '@artkit/connect';
import { base64 } from 'ethers/lib/utils';
import { Entries, Entry, Node, Nodes, path, Volume } from 'imfs';
import { bundle } from 'packly';
import { parseTokenMetadata } from 'state';
import { createFileData, FileData, fileDataToString } from 'files';
import { NFTMetadataAttribute, populateTemplateMetadata } from 'web3-utils';

function createIframeHandler(
  iframe: HTMLIFrameElement,
  onSaveMetadata: (image: {
    image?: Uint8Array;
    attributes?: MetadataAttributes;
  }) => void,
) {
  return (event: MessageEvent<ArtkitMessageToHost>) => {
    if (event.source !== iframe.contentWindow) return;

    if (typeof event.data !== 'object' || event.data === null) return;

    if (event.data.type === Message.saveMetadata) {
      let image = event.data.image;

      if (image) {
        const dataStart = image.indexOf(',');

        image = image.slice(dataStart + 1);
      }

      onSaveMetadata({
        image: image ? new Uint8Array(base64.decode(image)) : undefined,
        attributes: event.data.attributes,
      });
    }
  };
}

function captureImageFromHtml(html: string, queryString = '') {
  return new Promise<{ image?: Uint8Array; attributes?: MetadataAttributes }>(
    (resolve) => {
      const src = `data:text/html,${encodeURIComponent(html)}${queryString}`;

      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.style.width = '550px';
      iframe.style.height = '550px';
      iframe.style.position = 'absolute';
      iframe.style.zIndex = '-10000';
      iframe.style.visibility = 'hidden';

      const handler = createIframeHandler(iframe, (data) => {
        // console.log('captured data', data);

        // Remove this handler and iframe
        window.removeEventListener('message', handler);
        document.body.removeChild(iframe);

        resolve(data);
      });

      window.addEventListener('message', handler);

      document.body.appendChild(iframe);
    },
  );
}

function normalizeMetadataAttributes(
  attributes: MetadataAttributes,
): NFTMetadataAttribute[] {
  return Array.isArray(attributes)
    ? attributes
    : Object.entries(attributes).map(([key, value]) => ({
        trait_type: key,
        value,
      }));
}

export type ArtkitGeneratedMetadataItem = {
  image?: Entry<FileData>;
  attributes?: NFTMetadataAttribute[];
};
export type ArtkitGeneratedMetadata = Record<
  string,
  ArtkitGeneratedMetadataItem
>;
export type ArtkitGenerationHandle = {
  cancel: () => void;
  generated: Promise<ArtkitGeneratedMetadata | undefined>;
};

export function generateTokensFromWebsite(
  volume: Node<FileData>,
  entries: Entry<FileData, void>[],
  entry: string,
  onProgress: (progress: { current: number; total: number }) => void,
): ArtkitGenerationHandle {
  let canceled = false;

  function cancel() {
    canceled = true;
  }

  async function generate() {
    const html = bundle({
      entry,
      request: ({ url, origin }) => {
        if (/^(https?)?:\/\//.test(url)) return undefined;

        const fileUrl =
          origin && !url.startsWith('/') ? path.join(origin, '..', url) : url;

        let source: string;

        try {
          source = fileDataToString(Volume.readFile(volume, fileUrl));
        } catch (e) {
          return undefined;
        }

        return source;
      },
    });

    const generated: ArtkitGeneratedMetadata = {};

    for (let i = 0; i < entries.length; i++) {
      // Abort and return undefined
      if (canceled) return;

      const item: ArtkitGeneratedMetadataItem = {};

      const [name, file] = entries[i];

      if (file.type !== 'file') continue;

      const tokenId = path.basename(name, '.token.json');
      const existingMetadata = populateTemplateMetadata(
        parseTokenMetadata(file.data),
        { tokenId },
      );
      const queryStringIndex = existingMetadata.animation_url
        ? existingMetadata.animation_url.indexOf('?')
        : -1;
      let queryString =
        queryStringIndex !== -1
          ? existingMetadata.animation_url?.slice(queryStringIndex)
          : undefined;

      if (!queryString || !queryString.includes('?')) {
        queryString = '?isPreview=true';
      } else {
        queryString += '&isPreview=true';
      }

      const data = await captureImageFromHtml(html, queryString);

      // Check if we're canceled again to ensure we don't emit a progress update
      if (canceled) return;

      if (data.image) {
        item.image = Entries.createEntry(
          `${tokenId}.png`,
          Nodes.createFile(createFileData(data.image)),
        );
      }

      if (data.attributes) {
        item.attributes = normalizeMetadataAttributes(data.attributes);
      }

      generated[name] = item;

      onProgress({ current: i, total: entries.length });
    }

    return generated;
  }

  return {
    cancel,
    generated: generate(),
  };
}
