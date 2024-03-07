import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  w3f: {},
  solidity: "0.8.24",
  defaultNetwork: "blast_sepolia",

  networks: {
    hardhat: {
      accounts: [],
    },
    manta: {
      url: "https://pacific-rpc.manta.network/http",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 169,
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
    ],
  },
};

export default config;
