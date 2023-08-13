// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IUniswapV2Pair} from "./IUniswapV2Pair.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Taken from https://github.com/code-423n4/2022-05-velodrome/blob/main/contracts/contracts/interfaces/IPair.sol
interface IVelocorePair is IERC20 {
    function metadata()
        external
        view
        returns (
            uint dec0,
            uint dec1,
            uint r0,
            uint r1,
            bool st,
            address t0,
            address t1
        );

    function claimFees() external returns (uint, uint);

    function tokens() external returns (address, address);

    function transferFrom(
        address src,
        address dst,
        uint amount
    ) external returns (bool);

    function permit(
        address owner,
        address spender,
        uint value,
        uint deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function swap(
        uint amount0Out,
        uint amount1Out,
        address to,
        bytes calldata data
    ) external;

    function burn(address to) external returns (uint amount0, uint amount1);

    function mint(address to) external returns (uint liquidity);

    function getReserves()
        external
        view
        returns (
            uint112 _reserve0,
            uint112 _reserve1,
            uint32 _blockTimestampLast
        );

    function getAmountOut(uint, address) external view returns (uint);
}
