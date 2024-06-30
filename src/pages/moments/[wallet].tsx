// pages/moments/[wallet].tsx
import { useRouter } from 'next/router';
import UserNFTs from '../../components/UserNFTs';
import React from 'react';

const WalletPage: React.FC = () => {
  const router = useRouter();
  const { wallet } = router.query;

  return (
    <div>
      <header>
        <a href="/"><h1 className="logo"><span>RECOLEX</span></h1></a>
      </header>
      {wallet && typeof wallet === 'string' ? <UserNFTs wallet={wallet} /> : <p>Loading...</p>}
    </div>
  );
};

export default WalletPage;