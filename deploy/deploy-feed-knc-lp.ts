import { Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the pyth aggregator contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("PythAggregatorV3KNCLP");

  const usdcPriceFeed =
    "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";
  const usdtPriceFeed =
    "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b";

  // Estimate contract deployment fee
  const args = [
    usdcPriceFeed, // bytes32 _priceIdA,
    usdtPriceFeed, // bytes32 _priceIdB,
    "0xf087c864AEccFb6A2Bf1Af6A0382B0d0f6c5D834", // address _pyth,
    "0x4d321cd88c5680ce4f85bb58c578dfe9c2cc1ef6", // address _lp
    10,
  ];

  const deploymentFee = await deployer.estimateDeployFee(artifact, args);

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const greeterContract = await deployer.deploy(artifact, args);

  //obtain the Constructor Arguments
  console.log(
    "Constructor args:" + greeterContract.interface.encodeDeploy(args)
  );

  // Show the contract info.
  const contractAddress = greeterContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // verify contract for tesnet & mainnet
  if (process.env.NODE_ENV != "test") {
    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const contractFullyQualifedName =
      "contracts/PythAggregatorV3KNCLP.sol:PythAggregatorV3KNCLP";

    // Verify contract programmatically
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: contractFullyQualifedName,
      constructorArguments: args,
      bytecode: artifact.bytecode,
    });
  } else {
    console.log(`Contract not verified, deployed locally.`);
  }
}
