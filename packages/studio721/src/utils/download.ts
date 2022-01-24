import { fileSave } from 'browser-fs-access';

export async function saveFile(
  name: string,
  type: string,
  extension: string,
  data: ArrayBuffer,
) {
  const file = new File([data], name, { type });

  await fileSave(
    file,
    { fileName: file.name, extensions: [extension] },
    undefined,
    false,
  );
}
