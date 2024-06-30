'use client';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';

const HomePage: React.FC = () => {
  const account = useAccount();
  return (
    <Layout>
      <Head>
        <title>Recolex | Minting Moments</title>
      </Head>
      <div className="container text-center">
        <div className="top-container">
          <div className="logo-container">
            <div className="big-quote-container">
              <img src="/big-quote.gif" alt="big quote" />
            </div>
            <h1 className="logo home"><span>RECOLEX</span></h1>
            <div className="sub-logo-container">
              <div className="homepage-content">
                <div className="row">
                  <div className="minting-text">Your moments don't really belong to you... yet</div>
                </div>
                <div className="text">
                  <span className="green">Social media companies own all the content you upload</span> to their apps.  So what happens to all your memories?
                </div>
                <div>
                  We're on a mission to help people <span className="green">mint 1 million personal milestones onchain.</span>  We envision a future where you own your content fueled by decentralized technology!
                </div>
              </div>
            </div>
          </div>
          <div className="mint-container">
            <img className="animated-gif" src="/recolex-animation.gif" />
            <div className="moment-container">
              <div className="big-green-text">Own Your Moment</div>
              <div>Now you can create, share, and sell <span className="green">your own content</span> with our custom builder</div>
              <div>
                <a href="/create" className="build-moment-button">
                  <img src="/build-moment.gif" alt="Build Your Moment" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
