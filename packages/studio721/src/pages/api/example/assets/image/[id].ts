import Cors from 'cors';
import type { NextApiRequest, NextApiResponse } from 'next';
import { initMiddleware } from 'utils';
import { picsumItems } from '../../../../../utils/exampleImages';
// import fetch from 'cross-fetch';

const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  await cors(req, res);

  const item = picsumItems[Number(id) % picsumItems.length];

  const url = `https://picsum.photos/id/${item.id}/510/510`;

  res.redirect(url);

  // try {
  //   const response = await fetch(url as string);

  //   if (response.status >= 400) {
  //     res.status(response.status).send(response.statusText);
  //     return;
  //   }

  //   const data = await response.arrayBuffer();

  //   response.headers.forEach((value, key) => {
  //     res.setHeader(key, value);
  //   });

  //   res.status(200).send(Buffer.from(data));
  // } catch (error) {
  //   res.status(500).send((error as Error).message);
  // }
}
