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
    priceIdsUSD.matic,
    priceIdsUSD.usdc,
    priceIdsUSD.usdt,
    priceIdsUSD.wbtc,
    priceIdsUSD.wsteth,
    priceIdsUSD.tia,
  ];

  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  ); // See Hermes endpoints section below for other endpoints
  const priceUpdateData = (await connection.getPriceFeedsUpdateData(
    updateData
  )) as any;

  const tx = await contract.write.updateFeeds([priceUpdateData], {
    value: 10000000000000000n,
  });

  console.log(`tx`, tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
