import UserNFTs from '../components/UserNFTs';
import { useAccount } from 'wagmi';
import React from 'react';

const WalletPage: React.FC = () => {
  const { address } = useAccount();
  return (
    <div>
      <header>
        <a href="/"><h1 className="logo"><span>RECOLEX</span></h1></a>
      </header>
      {address && typeof address === 'string' ? <UserNFTs wallet={address} /> : <p>Loading...</p>}
    </div>
  );
};

export default WalletPage;