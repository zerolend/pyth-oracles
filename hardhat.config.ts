import { HardhatUserConfig } from "hardhat/config";

import "@gelatonetwork/web3-functions-sdk/hardhat-plugin";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";

const config: HardhatUserConfig = {
  w3f: {
    rootDir: "./web3-functions",
    debug: false,
    networks: ["zkSyncEra"], //(multiChainProvider) injects provider for these networks
  },

  zksolc: {
    version: "1.3.13",
    settings: {},
  },
  defaultNetwork: "zkSyncEra",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli",
      zksync: true,
      // contract verification endpoint
      verifyURL:
        "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
    },
    zkSyncEra: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      chainId: 324,
      // contract verification endpoint
      verifyURL:
        "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
    },
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
