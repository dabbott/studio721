import { fileOpen, fileSave, FileSystemHandle } from 'browser-fs-access';
import { FileData, Zip } from 'files';
import { Node } from 'imfs';

export async function openCollectionFile() {
  const file = await fileOpen({
    extensions: ['.zip'],
  });

  const zip = await Zip.fromFile(file);
  const volume = await Zip.toVolume(zip);

  return { fileHandle: file.handle, volume };
}

export async function saveCollectionFile(
  volume: Node<FileData>,
  existingFileHandle?: FileSystemHandle,
) {
  const zip = await Zip.fromVolume(volume);
  const file = await Zip.toFile(zip, 'Collection.zip');

  const fileHandle = await fileSave(
    file,
    { fileName: file.name, extensions: ['.zip'] },
    existingFileHandle,
    false,
  );

  return fileHandle || undefined;
}
