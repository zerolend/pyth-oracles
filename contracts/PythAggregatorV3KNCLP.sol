//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {IKyberSwapClassicPair} from "./interfaces/IKyberSwapClassicPair.sol";
import {IERC20WithDeciamls} from "./interfaces/IERC20WithDeciamls.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Math} from "./Math.sol";

import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

contract PythAggregatorV3KNCLP {
    using SafeMath for uint256;
    using Math for uint256;

    IPyth public pyth;
    IKyberSwapClassicPair public lp;

    IERC20WithDeciamls public tokenA;
    IERC20WithDeciamls public tokenB;

    bytes32 public priceIdA;
    bytes32 public priceIdB;

    uint256 public constant TARGET_DIGITS = 8;

    constructor(
        bytes32 _priceIdA,
        bytes32 _priceIdB,
        address _pyth,
        address _lp
    ) {
        lp = IKyberSwapClassicPair(_lp);

        priceIdA = _priceIdA;
        priceIdB = _priceIdB;

        tokenA = IERC20WithDeciamls(lp.token0());
        tokenB = IERC20WithDeciamls(lp.token1());

        // TODO: enforce only 8 decimal pyth price feeds

        pyth = IPyth(_pyth);
    }

    function fetchPrice() external view returns (uint256) {
        return _fetchPrice();
    }

    function tokenAPrice() public view returns (uint256) {
        return getPythResponse256(priceIdA);
    }

    function tokenBPrice() public view returns (uint256) {
        return getPythResponse256(priceIdB);
    }

    function _fetchPrice() internal view returns (uint) {
        uint256 totalSupply = lp.totalSupply();
        (, , uint256 r0, uint256 r1, ) = lp.getTradeInfo();
        uint256 amplification = lp.ampBps() / 10000;

        uint256 sqrtK = Math.sqrt(r0.mul(r1).div(amplification)).fdiv(
            totalSupply
        ); // in 2**112

        uint256 px0 = getPythResponse112(tokenA, priceIdA); // in 2**112
        uint256 px1 = getPythResponse112(tokenB, priceIdB); // in 2**112

        uint256 answer = sqrtK
            .mul(2)
            .mul(Math.sqrt(px0))
            .div(2 ** 56)
            .mul(Math.sqrt(px1))
            .div(2 ** 56);

        return answer.mul(1e18).div(2 ** 112);
    }

    /// @dev Return token price, multiplied by 2**112
    /// @param token Token address to get price
    /// @param _priceId pyth network price id
    function getPythResponse112(
        IERC20WithDeciamls token,
        bytes32 _priceId
    ) public view virtual returns (uint256) {
        uint256 _decimals = uint256(token.decimals());
        uint256 _price = getPythResponse256(_priceId);
        return _price.mul(2 ** 112).div(10 ** _decimals);
    }

    function getPythResponse256(
        bytes32 _priceId
    ) public view virtual returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceUnsafe(_priceId);
        return uint256(int256(price.price));
    }

    function decimals() external pure returns (uint8) {
        return uint8(TARGET_DIGITS);
    }

    function description() external pure returns (string memory) {
        return "A chainlink v3 aggregator for Uniswap v2 LP tokens.";
    }

    function version() external pure returns (uint256) {
        return 1;
    }

    function getRoundData(
        uint80 _roundId
    )
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (_roundId, int256(_fetchPrice()), 0, block.timestamp, _roundId);
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, int256(_fetchPrice()), 0, block.timestamp, 1);
    }

    function latestAnswer() external view returns (int256) {
        return int256(_fetchPrice());
    }

    function latestTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    function latestRound() external view returns (uint256) {
        return block.timestamp;
    }

    function getAnswer(uint256) external view returns (int256) {
        return int256(_fetchPrice());
    }

    function getTimestamp(uint256) external view returns (uint256) {
        return block.timestamp;
    }
}
