import hre from "hardhat";

async function main() {
  const args = [
    "0x6e3661519025D6cBcAFD3013D5BDB7aB71741B99",
    "0x775553444d000000000000000000000000000000000000000000000000000000",
  ];

  const contract = await hre.viem.deployContract("RedStoneAggregator", args);

  // contract.write.updateAnswer([1n]);

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
