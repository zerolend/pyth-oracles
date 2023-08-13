import { Provider } from "zksync-web3";
import * as ethers from "ethers";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first!
import * as IUniswapV2PairArtifcat from "../artifacts-zk/contracts/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json";
import * as IERC20WithDeciamlsArtifact from "../artifacts-zk/contracts/interfaces/IERC20WithDeciamls.sol/IERC20WithDeciamls.json";

// Use this contract to details of a uniswap v2 lp token
export default async function () {
  const lpPair = "0xF6CC0F880150a08695B7913638F12C08e785b032";
  console.log(`Running script to interact with contract ${lpPair}`);

  // // @ts-ignore
  const provider = new Provider("https://mainnet.era.zksync.io");

  // Initialize contract instance
  const lp = new ethers.Contract(lpPair, IUniswapV2PairArtifcat.abi, provider);

  console.log("getting lp token details");
  const token0 = await lp.token0();
  const token1 = await lp.token1();

  console.log("getting lp token details");
  const getReserves = await lp.getReserves();
  console.log(getReserves.reserve0.toString() / 1e6);
  console.log(getReserves.reserve1.toString() / 1e6);

  console.log("");
  console.log("token0", token0);
  const t0 = new ethers.Contract(
    token0,
    IERC20WithDeciamlsArtifact.abi,
    provider
  );
  console.log("token0 symbol", await t0.symbol());
  console.log("token0 name", await t0.name());
  console.log("token0 decimals", await t0.decimals());

  console.log("");
  console.log("token1", token1);
  const t1 = new ethers.Contract(
    token1,
    IERC20WithDeciamlsArtifact.abi,
    provider
  );
  console.log("token1 symbol", await t1.symbol());
  console.log("token1 name", await t1.name());
  console.log("token1 decimals", await t1.decimals());
}
