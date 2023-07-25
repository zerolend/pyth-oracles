// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IUniswapV2Pair} from "./IUniswapV2Pair.sol";

interface IKyberSwapClassicPair is IUniswapV2Pair {
    // Kyberswap ReserveData
    function getTradeInfo()
        external
        view
        returns (
            uint112 _reserve0,
            uint112 _reserve1,
            uint112 _vReserve0,
            uint112 _vReserve1,
            uint256 _feeInPrecision
        );

    function ampBps() external view returns (uint32);
}
