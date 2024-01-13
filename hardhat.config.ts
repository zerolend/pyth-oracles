import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    manta: {
      url: "https://pacific-rpc.manta.network/http",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 169,
    },
  },
  etherscan: {
    apiKey: {
      manta: process.env.MANTA_API_KEY || "nothing",
    },
    customChains: [
      {
        network: "manta",
        chainId: 169,
        urls: {
          apiURL: "https://manta-pacific.l2scan.co/api/contract",
          browserURL: "https://manta-pacific.l2scan.co",
        },
      },
    ],
  },
};

export default config;
