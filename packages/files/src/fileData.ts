import { Brand, UTF16 } from 'utils';

export type FileJSON = Brand<unknown, 'json'>;

export type FileData =
  | {
      encoding: 'string';
      value: string;
    }
  | {
      encoding: 'json';
      value: FileJSON;
    }
  | {
      encoding: 'bytes';
      value: Uint8Array;
    };

export function createFileData(
  value: string | Uint8Array | FileJSON,
): FileData {
  return typeof value === 'string'
    ? { encoding: 'string', value }
    : value instanceof Uint8Array
    ? { encoding: 'bytes', value }
    : { encoding: 'json', value };
}

export function fileDataToString(fileData: FileData): string {
  switch (fileData.encoding) {
    case 'bytes':
      return UTF16.fromUTF8(fileData.value);
    case 'string':
      return fileData.value;
    case 'json':
      return JSON.stringify(fileData.value);
  }
}

export function fileDataToBytes(fileData: FileData): Uint8Array {
  switch (fileData.encoding) {
    case 'bytes':
      return fileData.value;
    case 'string':
      return UTF16.toUTF8(fileData.value);
    case 'json':
      return UTF16.toUTF8(JSON.stringify(fileData.value));
  }
}
