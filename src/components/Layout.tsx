import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <div className="hamburger-menu" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={menuOpen ? 'menu open' : 'menu close'}>
        <span className="close-btn" onClick={toggleMenu}>&times;</span>
        <Link href="/create">Create New Moment</Link>
        {isConnected && (
          <Link href="/my-moments">My Moments</Link>
        )}
        <div className="bottom-nav">
          <ConnectButton showBalance={false} />
        </div>
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
