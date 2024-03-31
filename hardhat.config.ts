import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@gelatonetwork/web3-functions-sdk/hardhat-plugin";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  w3f: {
    rootDir: "./web3-functions",
    debug: false,
    networks: ["blast", "zksync"], //(multiChainProvider) injects provider for these networks
  },

  solidity: "0.8.24",
  defaultNetwork: "zksync",

  networks: {
    hardhat: {
      accounts: [],
    },
    manta: {
      url: "https://pacific-rpc.manta.network/http",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 169,
    },
    linea: {
      url: "https://rpc.linea.build",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 59144,
    },
    zksync: {
      url: "https://mainnet.era.zksync.io",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 324,
      zksync: true,
    },
    blast_sepolia: {
      url: "https://sepolia.blast.io",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 168587773,
    },
    blast: {
      url: "https://rpc.ankr.com/blast",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 81457,
    },
  },
  etherscan: {
    apiKey: {
      manta: process.env.MANTA_API_KEY || "nothing",
      linea: process.env.LINEA_API_KEY || "nothing",
      blast_sepolia: "nothing",
    },
    customChains: [
      {
        network: "manta",
        chainId: 169,
        urls: {
          apiURL: "https://pacific-explorer.manta.network/api",
          browserURL: "https://pacific-explorer.manta.network",
        },
      },
      {
        network: "blast_sepolia",
        chainId: 168587773,
        urls: {
          apiURL:
            "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
          browserURL: "https://testnet.blastscan.io",
        },
      },
      {
        network: "linea",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build",
        },
      },
    ],
  },
};

export default config;
