import * as fflate from 'fflate';
import { Directory, Entries, Node, Volume } from 'imfs';
import { createFileData, FileData, fileDataToBytes } from './fileData';
import { FileSystem } from './fileSystem';

export type Zip = fflate.Unzipped;

function unzip(bytes: Uint8Array): Promise<Zip> {
  return new Promise((resolve, reject) => {
    fflate.unzip(bytes, (error, zip) => {
      if (error) {
        reject(error);
      } else {
        resolve(zip);
      }
    });
  });
}

function zip(zip: Zip): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    fflate.zip(zip, (error, bytes) => {
      if (error) {
        reject(error);
      } else {
        resolve(bytes);
      }
    });
  });
}

async function toVolume(zip: Zip) {
  const volume = Volume.create<FileData>() as Directory<FileData>;

  for (const [filename, bytes] of Object.entries(zip)) {
    // TODO: Does fflate preserve folders?
    if (filename.endsWith('/')) {
      Volume.makeDirectory(volume, filename);
    } else {
      const data = createFileData(bytes);

      Volume.writeFile(volume, filename, data, {
        makeIntermediateDirectories: true,
      });
    }
  }

  return volume;
}

async function fromVolume(volume: Node<FileData>): Promise<Zip> {
  const zip: Zip = {};

  FileSystem.visit(Entries.createEntry('/', volume), ([filename, node]) => {
    if (filename === '/') return;

    if (node.type === 'directory') {
      // TODO: Preserve directories?
    } else {
      zip[filename] = fileDataToBytes(node.data);
    }
  });

  return zip;
}

async function toFile(data: Zip, name: string) {
  const bytes = await zip(data);

  const file = new File([bytes], name, {
    type: 'application/zip',
  });

  return file;
}

async function fromFile(file: File): Promise<Zip> {
  const arrayBuffer = await file.arrayBuffer();

  return unzip(new Uint8Array(arrayBuffer));
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Zip = {
  zip,
  unzip,
  fromVolume,
  toVolume,
  fromFile,
  toFile,
};
