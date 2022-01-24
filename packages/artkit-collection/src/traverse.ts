import { FileData, FileSystem } from 'files';
import { Entries, Node } from 'imfs';
import { parseTokenMetadata } from 'state';
import { NFTMetadata } from 'web3-utils';

export function findAllTokenFiles(
  volume: Node<FileData>,
  predicate?: (name: string, metadata: NFTMetadata) => boolean,
) {
  return FileSystem.findAll(Entries.createEntry('/', volume), (entry) => {
    if (entry[1].type !== 'file') return false;

    if (!entry[0].endsWith('.token.json')) return false;

    if (!predicate) return true;

    const metadata = parseTokenMetadata(entry[1].data);

    return predicate(entry[0], metadata);
  });
}
