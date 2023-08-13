import { Provider } from "zksync-web3";
import * as ethers from "ethers";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first!
import * as IVelocorePair from "../artifacts-zk/contracts/interfaces/IVelocorePair.sol/IVelocorePair.json";
import * as ERC20Permit from "../artifacts-zk/@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol/ERC20Permit.json";

// Use this contract to details of a uniswap v2 lp token
export default async function () {
  const contract = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";

  // // @ts-ignore
  const provider = new Provider("https://mainnet.era.zksync.io");

  // Initialize contract instance
  const token = new ethers.Contract(contract, ERC20Permit.abi, provider);

  const e18 = ethers.BigNumber.from(10).pow(18);

  console.log("token domain seperator", await token.DOMAIN_SEPARATOR());
  console.log("token decimals", await token.decimals());
  console.log(
    "token total supply",
    (await token.totalSupply()).div(e18).toNumber()
  );
  // console.log("token total supply", (await token.totalSupply()).toNumber());
}
