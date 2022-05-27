import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React,{useEffect,useState, useRef} from "react";
import {providers, utils} from "ethers";
import Web3Modal from "web3modal";
import {BigNumber,utils} from "ethers";

export default function Home() {
const zero=BigNumber.from(0);
const [walletConnected,setWalletConnected]=useState(false);
const web3ModalRef=useRef();
const [tokenMinted,setTokenMinted]=useState(zero);
const [balanceOfCryptoDevTokens,setBalanceOfCryptoDevTokens]=useState(zero);

const getProviderOrSigner=async(needSigner=false)=>{
  const provider=await web3ModalRef.current.connect();
  const web3Provider=new providers.Web3Provider(provider);

  const {chainId}=await web3Provider.getNetwork();

  if(chainId!==4){
    window.alert("Change the network to Rinkeby");
    throw new Error("Change the netwok to Rinkeby");
  }

  if(needSigner){
    const signer=web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
}
const connectWallet=async()=>{
  try{
    await getProviderOrSigner();
    setWalletConnected(true);
  }catch(err){
    console.error(err)
  }
}


  useEffect(()=>{
    if(!walletConnected){
     web3ModalRef.current= new Web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disableInjectedProvider:false
      });
      connectWallet();
    }
  },[walletConnected]);
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

     <div className={styles.main}>
       <div>
         <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
              You can claim or mint Crypto Dev tokens here
          </div>
       </div>

      {walletConnected ? (
        <div>
          <div className={styles.description}>
            You have minted{utils.formatEther(balanceOfCryptoDevTokens)} Crypto Dev Tokens
          </div>
          <div className={styles.description}>
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted
          </div>
        </div>
      ):(
        <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
      )}

     </div>

      <footer className={styles.footer}>
      Made with &#10084;Ranjan
      </footer>
    </div>
  )
}
