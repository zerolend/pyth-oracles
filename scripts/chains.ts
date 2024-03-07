import { defineChain } from "viem";

export const blastChain = defineChain({
  id: 81457,
  name: "Blast",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/blast"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.zora.energy" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
});
