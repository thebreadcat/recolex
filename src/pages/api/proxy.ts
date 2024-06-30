// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { targetUrl } = req.body;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Error: ${response.statusText}` });
    }

    const data = await response.text();
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy error' });
  }
}
