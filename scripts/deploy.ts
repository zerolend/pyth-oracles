import hre from "hardhat";
import { priceIdsUSD, pythContracts } from "../utils/constants";
import { blastChain } from "./chains";

async function main() {
  const args = [pythContracts.linea, priceIdsUSD.usdt];

  // const client = await hre.viem.getPublicClient({
  //   chain: blastChain,
  // });
  const contract = await hre.viem.deployContract("PythAggregatorV3", args);
  console.log(`deployed to`, contract.address);

  // verify contract for tesnet & mainnet
  if (process.env.NODE_ENV != "test") {
    // Verify contract programmatically
    await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: args,
    });
  } else {
    console.log(`Contract not verified, deployed locally.`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
