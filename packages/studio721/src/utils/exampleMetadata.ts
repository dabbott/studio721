import { picsumItems } from './exampleImages';

type Data = {
  name: string;
  description: string;
  image: string;
  external_url: string;
  animation_url: string;
  attributes?: { trait_type: string; value: any }[];
};

export function getExampleMetadata(id: string | number) {
  const item = picsumItems[Number(id) % picsumItems.length];

  const data: Data = {
    name: `Token #${id}`,
    description: `An example nonfungible token. Photo by ${item.author} from https://picsum.photos.`,
    image: `https://picsum.photos/id/${item.id}/510/510`,
    external_url: item.url,
    animation_url: item.download_url,
    attributes: [
      {
        trait_type: 'Width',
        value: item.width,
      },
      {
        trait_type: 'Height',
        value: item.height,
      },
    ],
  };

  return data;
}
