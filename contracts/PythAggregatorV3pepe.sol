//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythAggregatorV3} from "./PythAggregatorV3.sol";

contract PythAggregatorV3pepe is PythAggregatorV3 {
    constructor(
        address _pyth,
        bytes32 _priceId
    ) PythAggregatorV3(_pyth, _priceId) {
        // do nothing
    }

    function decimals() public view virtual override returns (uint8) {
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceId);
        return uint8(-1 * int8(price.expo)) - 2;
    }

    function latestAnswer() public view virtual override returns (int256) {
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceId);
        return int256(price.price) / 100;
    }
}
