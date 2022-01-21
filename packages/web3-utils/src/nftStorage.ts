import { NFTStorage } from 'nft.storage';

export async function uploadToNFTStorage({
  blob,
  apiKey,
  isCar,
}: {
  blob: Blob;
  apiKey: string;
  isCar: boolean;
}) {
  const client = new NFTStorage({ token: apiKey });

  let totalStored = 0;

  if (!isCar) {
    return await client.storeBlob(blob);
  }

  return await client.storeCar(blob, {
    onStoredChunk: (latestChunk) => {
      totalStored += latestChunk;

      console.log('uploaded', {
        latestChunk,
        totalStored,
        fileSize: blob.size,
      });
    },
  });
}
