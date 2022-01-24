import { createFileData, FileData, FileJSON } from 'files';
import { Directory, Volume } from 'imfs';
import { range } from 'utils';
import { NFTMetadata } from 'web3-utils';

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
