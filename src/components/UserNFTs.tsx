'use client';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { abi } from '../contract-abi';
import Head from 'next/head';
import Layout from '../components/Layout';
import { ethers } from 'ethers';

const contractAddress = process.env.PEBBL_CONTRACT || '';

interface UserNFTsProps {
  wallet?: string;
}

const UserNFTs: React.FC<UserNFTsProps> = ({ wallet }) => {
  const { address, isConnected } = useAccount();
  const [tokenData, setTokenData] = useState<{ tokenId: number; uri: string }[]>([]);
  const [metadata, setMetadata] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    const userWallet = wallet || address;
    if (isConnected && userWallet) {
      fetchUserNFTs(userWallet);
    }
  }, [isConnected, address, wallet]);

  const fetchUserNFTs = async (walletAddress: string) => {
    try {
      const url = 'https://mainnet.base.org';
      const provider = new ethers.JsonRpcProvider(url);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const totalItems = await contract.totalCreatedItems();
      console.log('Total created items:', totalItems.toString());

      const tokenDataPromises = [];
      for (let i = 1; i <= totalItems; i++) {
        const balance = await contract.balanceOf(walletAddress, i);
        if (balance > 0) {
          const uri = await contract.uri(i);
          tokenDataPromises.push({ tokenId: i, uri });
        }
      }

      const tokenData = await Promise.all(tokenDataPromises);
      setTokenData(tokenData);
      fetchMetadataFromSupabase(tokenData);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setIsLoading(false); // Set loading to false if there's an error
    }
  };

  const fetchMetadataFromSupabase = async (tokens: { tokenId: number; uri: string }[]) => {
    try {
      for (const token of tokens) {
        const response = await axios.get(`/api/fetchMetadata?tokenIds=${token.tokenId}`);
        setMetadata((prevMetadata) => [...prevMetadata, ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching metadata from Supabase:', error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching all metadata
    }
  };

  return (
    <Layout>
      <Head>
        <title>User NFTs</title>
      </Head>
      <div className="innerpage-container">
        <h1>{wallet === address ? 'Your ' : `${wallet}'s`} Moments</h1>
        <div className="nft-library">
          {isLoading ? ( // Show loading text while fetching data
            <p>Loading...</p>
          ) : metadata.length > 0 ? (
            metadata.map((item, index) => (
              <div key={index} className="nft-library-item">
                <a href={`/nft/${item.token_id}`}>
                  <img style={{ width: '15.625rem', height: '15.625rem' }} src={item.image_url} alt={item.title} />
                </a>
                <a href={`/nft/${item.token_id}`} className="nft-title">{item.title}</a>
              </div>
            ))
          ) : (
            <p>No NFTs found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserNFTs;
