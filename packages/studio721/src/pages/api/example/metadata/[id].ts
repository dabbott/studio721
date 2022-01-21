import Cors from 'cors';
import type { NextApiRequest, NextApiResponse } from 'next';
import { initMiddleware } from 'utils';
import { picsumItems } from '../../../../utils/exampleImages';

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

type Data = {
  name: string;
  description: string;
  image: string;
  external_url: string;
  animation_url: string;
  attributes?: { trait_type: string; value: any }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { id } = req.query;

  await cors(req, res);

  const item = picsumItems[Number(id) % picsumItems.length];

  res.status(200).json({
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
  });
}
