// pages/api/metadata/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import axios from 'axios';
import { abi } from '../../../contract-abi';

const contractAddress: string = process.env.PEBBL_CONTRACT || '';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // Validate and parse the token ID
  if (!id || Array.isArray(id) || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid token ID' });
  }

  const tokenId = parseInt(id as string, 10);

  try {
    const url = 'https://mainnet.base.org';
    const provider = new ethers.JsonRpcProvider(url);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Get the metadata URI for the given token ID
    const tokenURI = await contract.uri(tokenId);

    // Fetch the metadata from the URI
    const response = await axios.get(tokenURI);
    const metadata = response.data;

    // Return the metadata as JSON
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
};

export default handler;
