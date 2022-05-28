import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React,{useEffect,useState, useRef} from "react";
import {providers, Contract} from "ethers";
import Web3Modal from "web3modal";
import {BigNumber,utils} from "ethers";
import {TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI} from '../constants/index'

export default function Home() {
const zero=BigNumber.from(0);
const [walletConnected,setWalletConnected]=useState(false);
const web3ModalRef=useRef();
const [tokenMinted,setTokenMinted]=useState(zero);
const [balanceOfCryptoDevTokens,setBalanceOfCryptoDevTokens]=useState(zero);
const [tokenAmount,setTokenAmount]=useState(zero);
const [loading,setLoading]=useState(false);
const [tokenToBeClaimed,setTokensToBeClaimed]=useState(zero);

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

const mintCryptoDevToken=async(amount)=>{
  try{
    const signer=await getProviderOrSigner(true)
    const tokenContract=new Contract(
      TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI,
      signer
    );

    const value=0.001*amount;

    const tx=await tokenContract.mint(amount,{value:utils.parseEther(value.toString())})
    setLoading(true);
    await tx.wait();
    setLoading(false);
    window.alert("Successfully minted Crypto Dev Token");
    await getBalanceOfCryptoDevTokens();
    await getTotalTokenMinted();
    await getTokensToBeClaimed();

  }catch(err){
    console.error(err)
  }
}

const getBalanceOfCryptoDevTokens=async()=>{
  try{
    const provider=new getProviderOrSigner();
    const tokenContract=new Contract(
      TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI,
      provider
    );

    const signer=getProviderOrSigner(true);
    const address=signer.getAddress();
    const balance=await tokenContract.balanceOf(address);
    setBalanceOfCryptoDevTokens(balance);

  }catch(err){
    console.error(err);
  }
}

const getTotalTokenMinted=async()=>{
try{
const provider=await getProviderOrSigner();
const tokenContract=new Contract(
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  provider
);
const _tokensMinted=await tokenContract.totalSupply();
setTokenMinted(_tokensMinted);
}catch(err){
  console.error(err)
}
}

const getTokensToBeClaimed=async()=>{
  try{
    const provider=await getProviderOrSigner()
    const nftContract=new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );
    const tokenContract=new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    )
    const signer=await getProviderOrSigner(true);
    const address=await signer.getAddress();
    const balance=await nftContract.balanceOf(address);

    if(balance===zero){
      setTokensToBeClaimed(zero)
    }else{
      var amount=0;

      for(var i=0;i<balance;i++){
        const tokenId=await nftContract.tokenOfOwnerByIndex(address,i)
        const claimed=await tokenContract.tokenIdsClaimed(tokenId)
        if(!claimed){
          amount++
        }
      }
      setTokensToBeClaimed(amount)
    }

  }catch(err){
    console.error(err)
    setTokensToBeClaimed(zero)
  }
}

const claimCryptoDevTokens=async()=>{
  try{
    const signer=await getProviderOrSigner(true);
    const tokenContract=new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    );
    const tx=await tokenContract.claim();
    setLoading(true);
    await tx.wait();
    setLoading(false);
    window.alert("Successfully claimed Crypto Dev tokens");
    await getBalanceOfCryptoDevTokens();
    await getTotalTokenMinted();
    await getTokensToBeClaimed();

  }catch(err){
    console.error(err);
  }
}



const renderButton=()=>{
  if(loading){
    return(
      <div>
        <button className={styles.button}>Loading...</button>
      </div>
    )
  }

  if(tokenToBeClaimed > 0){
    return(
      <div>
        <div className={styles.description}>
          {tokenToBeClaimed * 10} Tokens can be claimed!
        </div>
        <button className={styles.button} onClick={claimCryptoDevTokens}>
          Claim Tokens
        </button>
      </div>
    )
  }
  return(
    <div style={{display:"flex-col"}}>
      <div>
        <input type="number" placeholder="Amount of Token" onChange={(e)=>setTokenAmount(BigNumber.from(e.target.value))}/>
        <button className={styles.button} disabled={!(tokenAmount>0)} onClick={()=>mintCryptoDevToken(tokenAmount)}>
          Mint Tokens
        </button>
      </div>
    </div>
  )
}


  useEffect(()=>{
    if(!walletConnected){
     web3ModalRef.current= new Web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disableInjectedProvider:false
      });
      connectWallet();
      getBalanceOfCryptoDevTokens();
      getTotalTokenMinted();
      getTokensToBeClaimed();
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
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto
                Dev Tokens
              </div>
              <div className={styles.description}>
                Overall {utils.formatEther(tokenMinted)}/10000 have been minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
