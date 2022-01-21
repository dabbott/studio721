import { createCar } from 'car-file';
import { Entry } from 'imfs';
import { FileData, fileDataToBytes } from './fileData';

export async function createCarBlob(files: Entry<FileData>[]) {
  const { cid, content } = await createCar(
    files.flatMap(([path, file]) => {
      if (file.type === 'directory') return [];

      return [{ path, content: fileDataToBytes(file.data) }];
    }),
  );

  const blob = new Blob([content], {
    type: 'application/car',
  });

  return { cid, blob };
}
