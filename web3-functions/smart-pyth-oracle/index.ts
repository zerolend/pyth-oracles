/* eslint-disable @typescript-eslint/naming-convention */
import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { utils } from "ethers";

import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage } = context;

  const {
    priceIds: _priceIds,
    duration: _duration,
    updater: _updater,
  } = userArgs;
  const priceIds = _priceIds as string[];
  const duration = Number(_duration);
  const updater = String(_updater);

  // User Storage
  const lastUpdatedAt = Number(
    JSON.parse((await storage.get("lastUpdatedAt")) ?? "0")
  ) as number;

  // Price Update if 6hr are elapsed or price diff >2%
  if (Date.now() - lastUpdatedAt < duration)
    return {
      canExec: false,
      message: "cannot update now. time less than min",
    };

  // Get Pyth price data
  const connection = new EvmPriceServiceConnection(
    "https://xc-mainnet.pyth.network" // https://docs.pyth.network/documentation/pythnet-price-feeds/price-service
  );

  const check = (await connection.getLatestPriceFeeds(priceIds)) as any[];
  if (
    check.length == 0 ||
    check[0].price == undefined ||
    check[0].price.price == undefined
  ) {
    return { canExec: false, message: "No price available" };
  }

  const iface = new utils.Interface([
    "function updateFeeds(bytes[] calldata priceUpdateData) public payable",
  ]);

  let updatePriceData = await connection.getPriceFeedsUpdateData(priceIds);
  const data = iface.encodeFunctionData("updateFeeds", [updatePriceData]);

  const callData = [
    {
      to: updater,
      data,
    },
  ];

  console.log(`Updating Price and timestamp: ${Date.now()}`);
  await storage.set("lastUpdatedAt", JSON.stringify(Date.now()));
  return {
    canExec: true,
    callData,
  };
});
