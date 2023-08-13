import { Provider } from "zksync-web3";
import * as ethers from "ethers";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first!
import * as IKyberSwapClassicPair from "../artifacts-zk/contracts/interfaces/IKyberSwapClassicPair.sol/IKyberSwapClassicPair.json";
import * as PythAggregatorV3UniV2LP from "../artifacts-zk/contracts/PythAggregatorV3UniV2LP.sol/PythAggregatorV3UniV2LP.json";
import * as IERC20WithDeciamlsArtifact from "../artifacts-zk/contracts/interfaces/IERC20WithDeciamls.sol/IERC20WithDeciamls.json";

const two56 = ethers.BigNumber.from(2).pow(56);
const two112 = ethers.BigNumber.from(2).pow(112);
const e18 = ethers.BigNumber.from(10).pow(18);

function sqrt(value: ethers.BigNumber) {
  const ONE = ethers.BigNumber.from(1);
  const TWO = ethers.BigNumber.from(2);

  const x = ethers.BigNumber.from(value);
  let z = x.add(ONE).div(TWO);
  let y = x;
  while (z.sub(y).isNegative()) {
    y = z;
    z = x.div(z).add(z).div(TWO);
  }
  return y;
}

function fdiv(lhs: ethers.BigNumber, rhs: ethers.BigNumber) {
  return lhs.mul(two112).div(rhs);
}

// Use this contract to details of a uniswap v2 lp token
export default async function () {
  const feedAddr = "0xe6dc86153084039541BfBADd727DCA0E50276cA3";
  console.log(`Running script to interact with contract ${feedAddr}`);

  // // @ts-ignore
  const provider = new Provider("https://mainnet.era.zksync.io");

  // Initialize contract instance
  const feed = new ethers.Contract(
    feedAddr,
    PythAggregatorV3UniV2LP.abi,
    provider
  );
  const lp = new ethers.Contract(
    await feed.lp(),
    IKyberSwapClassicPair.abi,
    provider
  );
  console.log("getting lp token details");
  const token0 = await lp.token0();
  const token1 = await lp.token1();
  const getReserves = await lp.getReserves();
  const bps = 10000;

  const info = await lp.getTradeInfo();
  const amplification = await lp.ampBps();

  console.log("_vReserve0", info._vReserve0.toString());
  console.log("_vReserve1", info._vReserve1.toString());
  console.log(amplification / bps);

  console.log(getReserves.reserve0.toString() / 1e6);
  console.log(getReserves.reserve0.toString() / 1e6);
  console.log(getReserves.reserve1.toString() / 1e6);

  // uint256 totalSupply = lp.totalSupply();
  const totalSupply = await lp.totalSupply();
  console.log("totalSupply", totalSupply.toString());

  // (uint256 r0, uint256 r1) = lp.getReserves();
  // uint256 sqrtK = Math.sqrt(r0.mul(r1)).fdiv(totalSupply); // in 2**112
  const sqrtK = fdiv(
    sqrt(info._vReserve1.mul(info._vReserve0)).div(amplification / bps),
    totalSupply
  );
  console.log("sqrtK", sqrtK.toString());

  // uint256 px0 = _getPythResponse112(tokenA, priceIdA); // in 2**112
  // uint256 px1 = _getPythResponse112(tokenB, priceIdB); // in 2**112
  const px0 = await feed.getPythResponse112(token0, await feed.priceIdA());
  const px1 = await feed.getPythResponse112(token1, await feed.priceIdB());

  console.log("px0", px0.toString());
  console.log("px1", px1.toString());

  // uint256 answer = sqrtK
  //     .mul(2)
  //     .mul(Math.sqrt(px0))
  //     .div(2 ** 56)
  //     .mul(Math.sqrt(px1))
  //     .div(2 ** 56);

  const answer = sqrtK
    .mul(2)
    .mul(sqrt(px0))
    .div(two56)
    .mul(sqrt(px1))
    .div(two56);
  console.log("answer", answer.toString());

  // return answer.mul(1e18).div(2 ** 112);
  const final = answer.mul(e18).div(two112);
  const contact = await feed.latestAnswer();

  console.log("calculat final", final.toString());
  console.log("contract final", contact.toString());
  console.log("");

  const bal = ethers.BigNumber.from(5043439);
  console.log("deployer with answer", bal.mul(final).div(e18).toNumber() / 1e8);
  console.log(
    "deployer with contract",
    bal.mul(contact).div(e18).toNumber() / 1e8
  );

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
