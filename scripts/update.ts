import hre from "hardhat";
import { priceIdsUSD } from "../utils/constants";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

async function main() {
  const contract = await hre.viem.getContractAt(
    "PythAggregatorV3",
    "0x0Bd27617E20F09a8E7FFdaE281E383b4b2f7A742"
  );

  const updateData = [
    priceIdsUSD.eth,
    priceIdsUSD.usdc,
    priceIdsUSD.usdt,
    priceIdsUSD.wbtc,
    priceIdsUSD.wsteth,
    priceIdsUSD.tia,
    priceIdsUSD.manta,
  ];

  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  ); // See Hermes endpoints section below for other endpoints

  const priceUpdateData = (await connection.getPriceFeedsUpdateData(
    updateData
  )) as any;

  console.log("update", priceUpdateData);

  // const d = await hre.viem.getWalletClient(
  //   "0x0F6e98A756A40dD050dC78959f45559F98d3289d"
  // );

  // const t = await d.sendTransaction({
  //   to: d.account.address,
  //   data: "0x",
  //   gasPrice: "50000000000",
  //   nonce: "170",
  // });
  // console.log(t);

  const tx = await contract.write.updateFeeds([priceUpdateData], {
    value: 1000000000n,
    // gasPrice: "30000000000",
    // nonce: "166",
  });
  console.log(`tx`, tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
