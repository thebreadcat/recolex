// src/components/TogglePublicMintingButton.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { abi } from '../contract-abi';
import { ethers } from "ethers";

interface ContractCallButtonProps {
  tokenId: number | string | string[];
}

const contractConfig = {
  address: process.env.NEXT_PUBLIC_CONTRACT as `0x${string}`,
  abi,
} as const;

const MintACopy: React.FC<ContractCallButtonProps> = ({ tokenId }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [price, setPrice] = useState<BigInt>(ethers.parseEther("0.0004"));
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<any | null>(null);

  const {
    data: hash,
    writeContract: doOnChainTransaction,
    isPending: isProcessing,
    isSuccess: isStarted,
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
      console.log('success!');
    }
  }, [txSuccess, txData]);

  return (
    <div>
      {mintError && (
        <p style={{ marginTop: 24, color: '#C77FCB' }}>
          You may have cancelled the transaction, try again please.
        </p>
      )}
      {txError && (
        <p style={{ marginTop: 24, color: '#C77FCB' }}>
          Something happened to the transaction, try again please.
        </p>
      )}
      {mounted && isConnected && !txSuccess && (
        <button
          style={{ marginTop: 24 }}
          disabled={!doOnChainTransaction || isProcessing || isStarted}
          className="mint-button"
          data-mint-loading={isProcessing}
          data-mint-started={isStarted}
          onClick={async () => {
            if (!contractConfig.address) {
              throw new Error('Contract address is undefined');
            }

            doOnChainTransaction?.({
              abi: contractConfig.abi,
              address: contractConfig.address,
              functionName: 'mint',
              args: [BigInt(tokenId.toString()), BigInt('1')],
              value: BigInt(price.toString())
            });
          }}
        >
          {isProcessing && 'Waiting for approval'}
          {isStarted && 'Processing...'}
          {!isProcessing && !isStarted && (
            <span>Mint A Copy</span>
          )}
        </button>
      )}
      {!isConnected && (
        <div>
          Please Connect your Wallet
        </div>
      )}
    </div>
  );
};

export default MintACopy;
