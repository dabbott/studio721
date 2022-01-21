import { FileData } from 'files';
import { Node, path, Volume } from 'imfs';

export function getEntryFile(
  volume: Node<FileData>,
  selectedFile: string,
): string | undefined {
  if (selectedFile.endsWith('.html')) return selectedFile;

  const node = Volume.getNode(volume, selectedFile);

  if (node.type === 'directory' && 'index.html' in node.children) {
    return path.join(selectedFile, 'index.html');
  }

  return undefined;
}
