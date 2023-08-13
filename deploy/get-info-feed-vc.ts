import { Provider } from "zksync-web3";
import * as ethers from "ethers";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first!
import * as IVelocorePair from "../artifacts-zk/contracts/interfaces/IVelocorePair.sol/IVelocorePair.json";
import * as PythAggregatorV3VCStableLP from "../artifacts-zk/contracts/PythAggregatorV3VCStableLP.sol/PythAggregatorV3VCStableLP.json";
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
  const feedAddr = "0x70221cF3eE22cEB081A0922DA5a5c3505c68468C";
  console.log(`Running script to interact with contract ${feedAddr}`);

  // // @ts-ignore
  const provider = new Provider("https://mainnet.era.zksync.io");

  // Initialize contract instance
  const feed = new ethers.Contract(
    feedAddr,
    PythAggregatorV3VCStableLP.abi,
    provider
  );
  const lp = new ethers.Contract(await feed.lp(), IVelocorePair.abi, provider);
  console.log("getting lp token details");
  // const token0 = await lp.token0();
  // const token1 = await lp.token1();
  const metadata = await lp.metadata();

  const r0 = metadata.r0;
  const r1 = metadata.r1;
  console.log("reserve0", r0.toString());
  console.log("reserve1", r1.toString());

  // console.log(getReserves.reserve0.toString() / 1e6);
  // console.log(getReserves.reserve0.toString() / 1e6);
  // console.log(getReserves.reserve1.toString() / 1e6);

  // uint256 totalSupply = lp.totalSupply();
  const totalSupply = await lp.totalSupply();
  console.log("totalSupply", totalSupply.toString());

  //   function k() public view returns (uint) {
  //     (uint dec0, uint dec1, uint x, uint y, bool st, , ) = lp.metadata();
  //     if (st) {
  //         uint _x = (x * 1e18) / dec0;
  //         uint _y = (y * 1e18) / dec1;
  //         uint _a = (_x * _y) / 1e18;
  //         uint _b = ((_x * _x) / 1e18 + (_y * _y) / 1e18);
  //         return (_a * _b) / 1e18; // x3y+y3x >= k
  //     } else {
  //         return x * y; // xy >= k
  //     }
  // }

  const _x = r0.mul(e18).div(metadata.dec0);
  const _y = r1.mul(e18).div(metadata.dec1);
  const _a = _x.mul(_y).div(e18);
  const _b = _x.mul(_x).div(e18).add(_y.mul(_y).div(e18));

  const k = _a.mul(_b).div(e18);
  console.log("calculated k", k.toString());
  console.log("contract k", (await feed.k()).toString());

  // uint256 sqrtK = Math.sqrt(r0.mul(r1)).fdiv(totalSupply); // in 2**112
  const sqrtK = fdiv(sqrt(k), totalSupply);
  console.log("sqrtK", sqrtK.toString());

  // uint256 px0 = _getPythResponse112(tokenA, priceIdA); // in 2**112
  // uint256 px1 = _getPythResponse112(tokenB, priceIdB); // in 2**112
  const px0 = await feed.getPythResponse112(metadata.t0, await feed.priceIdA());
  const px1 = await feed.getPythResponse112(metadata.t1, await feed.priceIdB());
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

  const bal = await lp.balanceOf("0xb76F765A785eCa438e1d95f594490088aFAF9acc");
  // console.log("deployer with answer", bal.mul(final).div(e18).toNumber() / 1e8);
  console.log(
    "deployer with contract",
    bal.mul(contact).div(e18).toNumber() / 1e8
  );

  // console.log("");
  // console.log("token0", token0);
  // const t0 = new ethers.Contract(
  //   token0,
  //   IERC20WithDeciamlsArtifact.abi,
  //   provider
  // );
  // console.log("token0 symbol", await t0.symbol());
  // console.log("token0 name", await t0.name());
  // console.log("token0 decimals", await t0.decimals());

  // console.log("");
  // console.log("token1", token1);
  // const t1 = new ethers.Contract(
  //   token1,
  //   IERC20WithDeciamlsArtifact.abi,
  //   provider
  // );
  // console.log("token1 symbol", await t1.symbol());
  // console.log("token1 name", await t1.name());
  // console.log("token1 decimals", await t1.decimals());
}
