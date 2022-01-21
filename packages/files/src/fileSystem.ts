import { FileData } from 'files';
import { Entry, Nodes, path } from 'imfs';
import { withOptions } from 'tree-visit';
import { memoize } from 'utils';

type LabeledMatch =
  | (RegExpMatchArray & { groups: { label: string; number: string } })
  | null;

const numberedFileRE = /^(?<number>\d+)(?<label>.*)/;

const matchNumberedFile = memoize(
  (string: string) => string.match(numberedFileRE) as LabeledMatch,
);

function getEntries<Data, Metadata>(
  entry: Entry<Data, Metadata>,
): Entry<Data, Metadata>[] {
  const [pathname, node] = entry;

  return Nodes.isDirectory(node)
    ? Object.entries(node.children)
        .sort((a, b) => {
          const matchA = matchNumberedFile(a[0]);
          const matchB = matchNumberedFile(b[0]);

          if (matchA && matchB && matchA.groups.label === matchB.groups.label) {
            return (
              parseInt(matchA.groups.number) - parseInt(matchB.groups.number)
            );
          }

          return a[0].localeCompare(b[0]);
        })
        .map(([key, value]) => [path.join(pathname, key), value])
    : [];
}

export const FileSystem = withOptions<Entry<FileData>>({
  getChildren: getEntries,
});
