import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tokenIds = req.query.tokenIds;

  if (!tokenIds) {
    return res.status(400).json({ error: 'Missing tokenIds in query parameters' });
  }

  try {
    const tokenIdsArray = (typeof tokenIds === 'string' ? tokenIds.split(',') : tokenIds).map(id => parseInt(id, 10));

    if (tokenIdsArray.some(isNaN)) {
      return res.status(400).json({ error: 'Invalid tokenIds in query parameters' });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
}
