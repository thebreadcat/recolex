import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { promisify } from 'util';
import FormData from 'form-data';
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

const unlinkFile = promisify(fs.unlink);

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveFile = async (file: File) => {
  try {
    const stream = fs.createReadStream(file.filepath);
    const options = {
      pinataMetadata: {
        name: file.originalFilename,
      },
    };
    const response = await pinata.pinFileToIPFS(stream, options);
    await unlinkFile(file.filepath); // use promisify to handle async unlink

    return response;
  } catch (error) {
    throw error;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('hi');
  if (req.method === 'POST') {
    console.log('post');
    const form = formidable({ multiples: true });
    console.log('formidable?');
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Upload Error');
      }
      try {
        console.log('we got a file?');
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const response = await saveFile(file as File);
        const { IpfsHash } = response;
        return res.send(IpfsHash);
      } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
      }
    });
  } else if (req.method === 'GET') {
    try {
      const response = await pinata.pinList({
        pinataJWTKey: process.env.PINATA_JWT,
        pageLimit: 1,
      });
      res.json(response.rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).send('Server Error');
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
