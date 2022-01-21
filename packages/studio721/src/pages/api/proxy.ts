import Cors from 'cors';
import type { NextApiRequest, NextApiResponse } from 'next';
import { initMiddleware } from 'utils';
import fetch from 'cross-fetch';

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { url } = req.query;

  await cors(req, res);

  try {
    const response = await fetch(url as string);

    if (response.status >= 400) {
      res.status(response.status).send(response.statusText);
      return;
    }

    const responseText = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error(
        `Invalid JSON: ${
          (error as Error).message
        }\n\nOriginal response: ${responseText}`,
      );
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
}
