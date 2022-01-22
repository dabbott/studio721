import { fileOpen, fileSave, FileSystemHandle } from 'browser-fs-access';
import { FileSystem, createFileData, FileData, FileJSON, Zip } from 'files';
import { Directory, Entries, Node, Volume, File, Nodes, path } from 'imfs';
import { parseTokenMetadata } from 'state';
import { range } from 'utils';
import { NFTMetadata } from 'web3-utils';
import { populateTemplateMetadata } from '../components/browser/TokenCard';

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

function createPackageJson() {
  return createFileData(
    JSON.stringify(
      {
        private: true,
        collection: {
          schemaVersion: '0.0.1',
        },
      },
      null,
      2,
    ),
  );
}

const css = `body {
  margin: 0;
  line-height: 0;
}
`;

const script = `const { id, isPreview } = artkit.parseQueryParameters({
  id: 'number',
  isPreview: 'boolean'
})

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (isPreview) noLoop()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  const seed = id * 100000
  randomSeed(seed)
  noiseSeed(seed)

  const shape = random() < 0.5 ? 'Circle' : 'Square';
  
  background(random(255), random(255), random(255));
  noStroke()
  fill(random(255), random(255), random(255));
  const size = min(windowWidth, windowHeight) * 0.5

  if (shape === 'Circle') {
    circle(windowWidth / 2, windowHeight / 2, size)
  } else {
    rect(windowWidth / 4, windowHeight / 4, size)
  }
  
  if (isPreview) {
    saveMetadata({
      Shape: shape
    })
  }
}

// Call this function once the art has been fully rendered.
// This saves the metadata attributes and preview image.
function saveMetadata(attributes) {
  artkit.saveMetadata({
    attributes() {
      return attributes
    },
    // This function should return a 'data:' url containing an image
    image() {
      const canvas = document.querySelector('canvas')
      return canvas.toDataURL('image/png', 100)
    }
  })
}
`;

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Generative Art</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <script src="https://unpkg.com/p5@1.4.0"></script>
    <script src="https://unpkg.com/@artkit/connect@0.0.4"></script>
    <script src="./main.js"></script>
  </body>
</html>
`;

export function createDefaultToken(): NFTMetadata {
  return {
    name: 'Token #{tokenId}',
    description: 'An example nonfungible token.',
    image: `https://721.so/api/example/assets/image/{tokenId}`,
  };
}

export function createBasicMetadataVolume() {
  const volume = Volume.create<FileData>() as Directory<FileData>;

  Volume.writeFile(volume, '/package.json', createPackageJson());
  Volume.makeDirectory(volume, '/metadata');
  Volume.makeDirectory(volume, '/assets');

  for (const index of range(0, 3)) {
    Volume.writeFile(
      volume,
      `/metadata/${index}.token.json`,
      createFileData(JSON.stringify(createDefaultToken())),
    );
  }

  return volume;
}

export function createGenerativeArtCollection() {
  const volume = Volume.create<FileData>() as Directory<FileData>;

  Volume.writeFile(volume, '/package.json', createPackageJson());
  Volume.makeDirectory(volume, '/metadata');
  Volume.makeDirectory(volume, '/assets');
  Volume.writeFile(volume, '/assets/index.html', createFileData(html));
  Volume.writeFile(volume, '/assets/styles.css', createFileData(css));
  Volume.writeFile(volume, '/assets/main.js', createFileData(script));

  for (const index of range(0, 3)) {
    const metadata: NFTMetadata = {
      name: 'Token #{tokenId}',
      description: 'An example generative art token.',
      animation_url: '/assets/index.html?id={tokenId}',
    };

    Volume.writeFile(
      volume,
      `/metadata/${index}.token.json`,
      createFileData(metadata as FileJSON),
    );
  }

  return volume;
}

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

function replaceAbsoluteAssetWithIFPS(url: string, cid: string) {
  return url.startsWith('/assets/')
    ? `ipfs://${cid}/${encodeURI(url.replace('/assets/', ''))}`
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
          );
        }
        if (populated.animation_url) {
          populated.animation_url = replaceAbsoluteAssetWithIFPS(
            populated.animation_url,
            assetsRootCID,
          );
        }
      }

      const data = JSON.stringify(populated);
      return [entry[0], Nodes.createFile(createFileData(data))];
    }

    return entry;
  });
}
