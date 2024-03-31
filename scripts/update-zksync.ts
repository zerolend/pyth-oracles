import hre from "hardhat";
import { priceIdsUSD, pythContracts } from "../utils/constants";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

async function main() {
  const contract = await hre.viem.getContractAt(
    "PythAggregatorV3",
    "0x517F9cd13fE63e698d0466ad854cDba5592eeA73"
  );

  const updateData = [
    priceIdsUSD.eth,
    priceIdsUSD.usdc,
    priceIdsUSD.usdt,
    priceIdsUSD.wbtc,
    priceIdsUSD.wsteth,
    priceIdsUSD.cake,
  ];

  console.log(JSON.stringify(updateData));

  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  ); // See Hermes endpoints section below for other endpoints
  const priceUpdateData = (await connection.getPriceFeedsUpdateData(
    updateData
  )) as any;

  const tx = await contract.write.updateFeeds([priceUpdateData], {
    value: 1000000000n,
  });

  console.log(`tx`, tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
