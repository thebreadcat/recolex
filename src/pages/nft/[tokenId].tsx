import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import axios from 'axios';
import Head from 'next/head';
import { abi } from '../../contract-abi';
import Layout from '../../components/Layout';
import TogglePublicMintingButton from '../../components/TogglePublicMintingButton';
import MintACopy from '../../components/MintACopy';
import { useRouter } from 'next/router';

const contractAddress = process.env.PEBBL_CONTRACT || '';

const NFTDetail: React.FC = () => {
  const router = useRouter();
  const { tokenId } = router.query;
  const { address, isConnected } = useAccount();
  const [metadata, setMetadata] = useState<any>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [publicMinting, setPublicMinting] = useState<boolean>(false);
  const [totalMints, setTotalMints] = useState<number>(0);
  const [tokenExists, setTokenExists] = useState<boolean>(true);

  console.log('token', tokenId, router, router.query);
  useEffect(() => {
    if (tokenId) {
      fetchMetadata();
      checkIsCreator();
      checkPublicMinting();
      fetchTotalMints();
    }
  }, [tokenId]);

  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`/api/fetchMetadata?tokenIds=${tokenId}`);
      var metadataResponse = (response.data && response.data.length > 0) ? response.data[0] : response.data;
      console.log('meta', metadataResponse);
      setMetadata(metadataResponse);
      setTokenExists(true);
    } catch (error) {
      console.error('Error fetching metadata from Supabase:', error);
      setTokenExists(false);
    } finally {
      //setIsLoading(false);
    }
  };

  const checkIsCreator = async () => {
    console.log('creator');
    try {
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const createdTokenCheck = await contract.isCreator(tokenId, address);
      console.log('creator?', createdTokenCheck);
      setIsCreator(createdTokenCheck);
    } catch (error) {
      console.error('Error checking creator:', error);
    }
  };

  const checkPublicMinting = async () => {
    console.log('public minting');
    try {
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const publicMinting = await contract.isPublicMintingEnabled(tokenId);
      console.log('Public Minting:', publicMinting);
      setPublicMinting(publicMinting);
    } catch (error) {
      console.error('Error checking public minting:', error);
    }
  };


  const fetchTotalMints = async () => {
    console.log('totalMints');
    try {
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const totalMints = await contract.getTotalMints(tokenId);
      console.log('Total Mints:', Number(totalMints));
      setTotalMints(Number(totalMints));
    } catch (error) {
      console.error('Error fetching total mints:', error);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Recolex | Minting Moments</title>
      </Head>
      <header>
        <a href="/"><h1 className="logo"><span>RECOLEX</span></h1></a>
      </header>
      <main>
        <div className="create-nft nft-detail-container">
          {tokenExists ? (
            metadata ? (
              <>
                <div className="nftData">
                  <img style={{width: '100%', height: 'auto'}} src={metadata.image_url} alt={metadata.title} />
                  <h1>{metadata.title}</h1>
                  <p>{metadata.description}</p>
                  {(metadata.attributes) && (
                  <ul>
                    {metadata.attributes.map((attr: any, index: number) => (
                      <li key={index}>
                        {attr.trait_type}: {attr.value}
                      </li>
                    ))}
                  </ul>
                  )}
                </div>
                <div className="nft-actions">
                  {isCreator && tokenId && (
                    <TogglePublicMintingButton buttonText={publicMinting ? 'Disable Minting' : 'Enable Minting'} tokenId={String(tokenId)} />
                  )}
                  {totalMints && (
                    <h3>{totalMints} Total Minted</h3>
                  )}
                  {publicMinting && tokenId && (
                    <MintACopy tokenId={tokenId.toString()} />
                  )}
                </div>
              </>
            ) : (
              <p>Loading...</p>
            )
          ) : (
            <p>Token ID does not exist.</p>
          )}
        </div>
      </main>
      <footer>
        <p>&copy; 2024 RECOLEX</p>
      </footer>
    </Layout>
  );
};

export default NFTDetail;
