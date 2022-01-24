import { createFileData, FileData, FileSystem } from 'files';
import { Entries, File, Node, Nodes, path } from 'imfs';
import { parseTokenMetadata } from 'state';
import { populateTemplateMetadata } from 'web3-utils';

function replaceAbsoluteAssetWithIFPS(
  url: string,
  cid: string,
  protocol: 'ipfs' | 'https',
) {
  return url.startsWith('/assets/')
    ? `${
        protocol === 'https' ? 'https://ipfs.io/ipfs/' : 'ipfs://'
      }${cid}/${encodeURI(url.replace('/assets/', ''))}`
    : url;
}

export function createEntriesFromVolume(
  volume: Node<FileData>,
  assetsRootCID?: string,
) {
  return FileSystem.findAll<[string, File<FileData>]>(
    Entries.createEntry('/', volume),
    (entry): entry is [string, File<FileData>] => entry[1].type === 'file',
  ).map((entry): [string, File<FileData>] => {
    // Populate metadata
    if (entry[0].endsWith('.token.json')) {
      const metadata = parseTokenMetadata(entry[1].data);
      const tokenId = path.basename(entry[0], '.token.json');
      const populated = populateTemplateMetadata(metadata, {
        tokenId,
      });

      if (assetsRootCID) {
        if (populated.image) {
          populated.image = replaceAbsoluteAssetWithIFPS(
            populated.image,
            assetsRootCID,
            'ipfs',
          );
        }
        if (populated.animation_url) {
          populated.animation_url = replaceAbsoluteAssetWithIFPS(
            populated.animation_url,
            assetsRootCID,
            'https',
          );
        }
      }

      const data = JSON.stringify(populated);
      return [entry[0], Nodes.createFile(createFileData(data))];
    }

    return entry;
  });
}
