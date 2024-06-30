'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import type { NextPage } from 'next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { abi } from '../contract-abi';

import { Textfit } from 'react-textfit';
import { Canvg } from 'canvg';
import html2canvas from 'html2canvas';
import { supabase } from '../utils/supabaseClient';
import Head from 'next/head';

import Layout from '../components/Layout';
import TopQuoteIcon from '../components/TopQuoteIcon';
import QuoteAuthorIcon from '../components/QuoteAuthorIcon';
import PictureMask from '../../public/pic_mask_2.svg';
import MilestoneIconYellow from '../components/MilestoneIconYellow';

const contractConfig = {
  address: process.env.NEXT_PUBLIC_CONTRACT as `0x${string}`,
  abi,
} as const;

const CreateNFT = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [allowPublicMinting, setAllowPublicMinting] = useState(false);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { address, isConnected } = useAccount();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#000000');
  const [momentStyle, setMomentStyle] = useState('image');
  const [metadataUrl, setMetadataUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputFile = useRef<HTMLInputElement | null>(null);

  const colors = ['#00EF8B', '#703CBB', '#CEFF65', '#373535', '#CDC44E', '#DDDBC7', '#C77FCB', '#9EA9F4', '#76D17F', '#000000','#ffffff'];

  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_KEY ?? '';
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET ?? '';
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT ?? '';

  const {
    data: hash,
    writeContract: mint,
    isPending: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useWriteContract();

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  useEffect(() => {
    if (txSuccess && txData) {
      saveNFTDataToSupabase(txData);
    }
  }, [txSuccess, txData]);

  const isMinted = txSuccess;


  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let debounceTimer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func(...args), delay);
    };
  };

  const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (fileToUpload: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', fileToUpload, fileToUpload.name);
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      const ipfsHash = await res.text();
      setCid(ipfsHash);
      setUploading(false);
    } catch (e) {
      console.error(e);
      setUploading(false);
      alert('Trouble uploading file');
    }
  };

  const loadRecent = async () => {
    try {
      const res = await fetch('/api/files');
      const json = await res.json();
      setCid(json.ipfs_pin_hash);
    } catch (e) {
      console.error(e);
      alert('Trouble loading files');
    }
  };

  const updatePreview = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current,{
        width: 1000,
        height: 1000,
      }).then((canvas) => {
        setProcessedImage(canvas.toDataURL('image/jpeg'));
      });
    }
  };

  const debouncedUpdatePreview = debounce(updatePreview, 1000);

  useEffect(() => {
    debouncedUpdatePreview();
  }, [title, description, date, uploadedImage, bgColor, fgColor, textColor, momentStyle]);

  const saveNFTDataToSupabase = async (txData: any) => {
    let tokenId;
    try {
      // Get the latest token_id from the database
      const { data: latestData, error: fetchError } = await supabase
        .from('pebbls')
        .select('token_id')
        .order('token_id', { ascending: false })
        .limit(1);

      if (fetchError) {
        throw new Error('Error fetching latest token_id: ' + fetchError.message);
      }
      const latestTokenId = latestData && latestData.length > 0 ? parseInt(latestData[0].token_id) : 0;
      const newTokenId = latestTokenId + 1;

      console.log('tokens', latestTokenId, newTokenId);

      const { data, error: insertError } = await supabase
        .from('pebbls')
        .insert([
          {
            wallet: address,
            token_id: newTokenId,
            transaction_hash: txData.transactionHash,
            metadata_url: metadataUrl,
            background_color: bgColor,
            foreground_color: fgColor,
            text_color: textColor,
            image_url: processedImage,
            layout: momentStyle,
            title,
            description,
            item_date: date,
          },
        ]);

      if (insertError) {
        console.error('Error saving NFT data to Supabase:', insertError);
      } else {
        console.log('NFT data saved to Supabase:', data);
      }
    } catch (error) {
      console.error('Error in saveNFTDataToSupabase:', error);
    }
  };


  const pinToIPFS = async (imageData: string) => {
    try {
      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append('file', blob, 'nft_image.png');
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      const ipfsHash = await res.text();
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (e) {
      console.error('Error uploading to IPFS', e);
      throw e;
    }
  };

  const generateMetadata = async (imageUrl: string) => {
    const metadata = {
      name: title,
      description: description,
      image: imageUrl,
      attributes: [
        { trait_type: 'Creation Date', value: date },
      ],
    };

    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      formData.append('file', blob, 'metadata.json');
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      const ipfsHash = await res.text();
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (error) {
      console.error('Error uploading metadata to IPFS', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options).replace(/\//g, '.');
  };

  const formatDateSlashes = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options).replace(/\//g, '//');
  };
  const renderColorSwatches = (selectedColor : string, setColor: React.Dispatch<React.SetStateAction<string>>) => (
    <div className="color-swatches">
      {colors.map((color) => (
        <div
          key={color}
          className="color-swatch"
          style={{
            backgroundColor: color,
            border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
          }}
          onClick={() => setColor(color)}
        />
      ))}
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>Recolex | Minting Moments</title>
      </Head>
      <header>
        <a href="/"><h1 className="logo"><span>RECOLEX</span></h1></a>
      </header>
      <main>
        <div className="create-nft">
          <div className="builder-form">
            <div className="form-group">
              <label>Moment Style</label>
              <select value={momentStyle} onChange={(e) => setMomentStyle(e.target.value)}>
                <option value="image">Image Moment</option>
                <option value="quote">Quote Moment</option>
                <option value="milestone">Milestone Moment</option>
              </select>
            </div>
            {momentStyle == 'image' && (
              <div className="form-group">
                <label>Upload Image</label>
                <input type="file" onChange={onImageUpload} accept="image/*" />
              </div>
            )}
            <div className="form-group">
              <label>{momentStyle == 'quote' || momentStyle == 'milestone' ? 'Author' : 'Title'}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
            </div>
            <div className="form-group">
              <label>{momentStyle == 'quote' ? 'Quote' : (momentStyle == 'milestone') ? 'Milestone' : 'Description (Only in Metadata)'}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description"></textarea>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Background Color</label>
              {renderColorSwatches(bgColor, setBgColor)}
            </div>
            {(momentStyle != 'milestone') && (
              <div className="form-group">
                <label>Foreground Color</label>
                {renderColorSwatches(fgColor, setFgColor)}
              </div>
            )}
            <div className="form-group">
              <label>Text Color</label>
              {renderColorSwatches(textColor, setTextColor)}
            </div>
            <div className="form-group">
              <label>Allow Public Minting?</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="public-minting-toggle"
                  checked={allowPublicMinting}
                  onChange={(e) => setAllowPublicMinting(e.target.checked)}
                />
                <label htmlFor="public-minting-toggle" className="toggle-label"></label>
              </div>
            </div>
            {mintError && (
              <p style={{ marginTop: 24, color: '#C77FCB' }}>
                You may have cancelled your mint, try again please.
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: '#C77FCB' }}>
                Something happened to the transaction, try again please.
              </p>
            )}

            {mounted && isConnected && !isMinted && (
              <button
                style={{ marginTop: 24 }}
                disabled={!mint || isMintLoading || isMintStarted}
                className="mint-button"
                data-mint-loading={isMintLoading}
                data-mint-started={isMintStarted}
                onClick={
                  async () => {
                    if (processedImage) {
                      //const canvas = await html2canvas(previewRef.current);
                      //const imageData = canvas.toDataURL('image/jpeg');
                      console.log('image?', processedImage);
                      //const imageUrl = await pinToIPFS(imageData);
                      //const tempMeta = await generateMetadata(imageUrl);
                      const imageUrl = await pinToIPFS(processedImage);
                      const tempMeta = await generateMetadata(imageUrl);
                      setMetadataUrl(tempMeta);
                      console.log('meta', metadataUrl, tempMeta);

                      if (!contractConfig.address) {
                        throw new Error('Contract address is undefined');
                      }

                      mint?.({
                        abi: contractConfig.abi,
                        address: contractConfig.address,
                        functionName: "createItem",
                        args: [tempMeta, allowPublicMinting],
                      });
                    }
                  }
                }
              >
                {isMintLoading && 'Waiting for approval'}
                {isMintStarted && 'Minting...'}
                {!isMintLoading && !isMintStarted && 'Generate NFT'}
              </button>
            )}
            {(!isConnected) && (
              <div>
                Please Connect your Wallet to Mint
              </div>
            )}
          </div>
          <div className="nft-preview">
            {processedImage && (
              <img className="preview-image" src={processedImage || undefined} alt="NFT Preview" style={{ maxWidth: '100%', height: 'auto' }} />
            )}
            <div ref={previewRef} className={`preview ${momentStyle}`} style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="extra-backgroud" style={{backgroundColor: bgColor, width: '1000px', height: '1000px', position: 'absolute', zIndex: '0', top: '0', left: '0', right: '0', bottom: '0'}}>
              {momentStyle === 'quote' && (
                <>
                  <div className="top-quote" style={{ fill: fgColor }}>
                    <TopQuoteIcon fill={fgColor} />
                  </div>
                  <div className="quote-text">{description}</div>
                  <div className="date-text">{formatDate(date)}</div>
                  <div className="quote-author">
                    <div className="quote-author-icon" style={{ fill: fgColor }}>
                      <QuoteAuthorIcon fill={fgColor} />
                    </div>
                    <span className="quote-author-name" style={{ color: bgColor }}>{title}</span>
                  </div>
                </>
              )}
              {momentStyle === 'milestone' && (
                <>
                  <div className="date-text">{formatDateSlashes(date)}</div>
                  <div className="milestone-container">
                    <MilestoneIconYellow />
                  </div>
                  <Textfit mode="multi" className="quote-text">{description}</Textfit>
                  <Textfit mode="single" forceSingleModeWidth={false} className="quote-author" style={{ color: textColor }}>
                    {title}
                  </Textfit>
                </>
              )}
              {momentStyle === 'image' && (
                <>
                  <div className="date-text">{formatDate(date)}</div>
                  <div className="image-mask" style={{ fill: fgColor }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 810 810">
                      <defs>
                        <clipPath id="pic_mask_2_svg__a">
                          <path d="M0 0h810v807.016H0Zm0 0"></path>
                        </clipPath>
                      </defs>
                      <path fill="none" d="M-81-81h972v972H-81z"></path>
                      <g clipPath="url(#pic_mask_2_svg__a)">
                        <path
                          d="M.898-2.383v809.399h809.403V-2.383Zm164.852 53.25c61.648 0 111.602 49.95 111.602 111.602 0 61.648-49.954 111.597-111.602 111.597S54.148 224.117 54.148 162.47c0-61.653 50.028-111.602 111.602-111.602m0 239.852c70.648 0 128.25-66.602 128.25-128.25 0-61.653 49.95-111.602 111.602-111.602 61.648 0 111.597 49.95 111.597 111.602 0 61.648-40.949 111.597-111.597 111.597-70.653 0-128.25 66.602-128.25 128.25 0 61.653-49.954 111.602-111.602 111.602S54.148 463.968 54.148 402.316c0-61.648 40.954-111.597 111.602-111.597M405.602 753.69H165.75c-61.648 0-111.602-49.949-111.602-111.597 0-61.653 49.954-111.602 111.602-111.602h239.852c61.648 0 111.597 49.95 111.597 111.602 0 61.648-49.949 111.597-111.597 111.597m239.847-479.625c-70.648 0-128.25 57.602-128.25 128.25 0 70.653 57.602 128.25 128.25 128.25 70.653 0 111.602 49.95 111.602 111.602 0 61.648-49.95 111.598-111.602 111.598-61.648 0-111.597-40.95-111.597-111.598 0-70.652-66.602-128.25-128.25-128.25-61.653 0-111.602-49.95-111.602-111.602 0-61.648 40.95-111.597 111.602-111.597 70.648 0 128.25-66.602 128.25-128.25 0-61.653 49.949-111.602 111.597-111.602 61.653 0 111.602 49.95 111.602 111.602 0 61.648-40.95 111.597-111.602 111.597m111.602 128.25c0 61.653-49.95 111.602-111.602 111.602-61.648 0-111.597-49.95-111.597-111.602 0-61.648 49.949-111.597 111.597-111.597 61.653 0 111.602 49.949 111.602 111.597m0 0"
                          fill={fgColor}
                        ></path>
                      </g>
                    </svg>
                  </div>
                  <Textfit mode="single" forceSingleModeWidth={false} className="image-title" style={{ color: textColor }}>
                    {title}
                  </Textfit>
                  {(uploadedImage) && (
                    <div className="image-image" style={{ backgroundImage: `url(${uploadedImage})` }}></div>
                  )}
                </>
              )}
            </div>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <p>&copy; 2024 RECOLEX</p>
      </footer>
    </Layout>
  );
};

export default CreateNFT;
