const {ethers}=require("hardhat");
require("dotenv").config({path:".env"});
const {CRYPTO_DEVS_NFT_CONTRACT_ADDRESS}=require("../constants");

async function main(){

  const cryptoDevsNFTContract=CRYPTO_DEVS_NFT_CONTRACT_ADDRESS;

  const cryptoDevsTokenContract=await ethers.getContractFactory("CryptoDevToken");

  const deployedCryptoDevsTokenContract=await cryptoDevsTokenContract.deploy(cryptoDevsNFTContract);

  console.log("Crypto Devs Token Contract Address:",deployedCryptoDevsTokenContract.address);


}

main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error);
  process.exit(1);
})


//Crypto Devs Token Contract Address: 0x7C50859D4391E3845Ef31c8f6E4442376114F258