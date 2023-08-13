//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

contract PythUpdater {
    IPyth public pyth;
    address public owner;

    constructor(address _pyth) {
        pyth = IPyth(_pyth);
        owner = msg.sender;
    }

    receive() external payable {}

    function updateFeeds(bytes[] calldata priceUpdateData) public payable {
        // Update the prices to the latest available values and pay the required fee for it. The `priceUpdateData` data
        // should be retrieved from our off-chain Price Service API using the `pyth-evm-js` package.
        // See section "How Pyth Works on EVM Chains" below for more information.
        uint fee = pyth.getUpdateFee(priceUpdateData);
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);
    }

    /// @dev refund remaining eth
    function refund() external {
        require(msg.sender == owner, "only owner");
        payable(msg.sender).call{value: address(this).balance}("");
    }
}
