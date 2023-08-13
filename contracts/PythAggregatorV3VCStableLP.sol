//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {IVelocorePair} from "./interfaces/IVelocorePair.sol";
import {IERC20WithDeciamls} from "./interfaces/IERC20WithDeciamls.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Math} from "./Math.sol";

import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

contract PythAggregatorV3VCStableLP {
    using SafeMath for uint256;
    using Math for uint256;

    IPyth public pyth;
    IVelocorePair public lp;

    bool isStable;
    IERC20WithDeciamls public tokenA;
    IERC20WithDeciamls public tokenB;

    uint8 public decimals0;
    uint8 public decimals1;

    bytes32 public priceIdA;
    bytes32 public priceIdB;

    uint256 public constant TARGET_DIGITS = 8;

    constructor(
        bytes32 _priceIdA,
        bytes32 _priceIdB,
        address _pyth,
        address _lp
    ) {
        lp = IVelocorePair(_lp);

        priceIdA = _priceIdA;
        priceIdB = _priceIdB;

        (uint dec0, uint dec1, , , bool st, address t0, address t1) = lp
            .metadata();

        isStable = st;
        tokenA = IERC20WithDeciamls(t0);
        tokenB = IERC20WithDeciamls(t1);

        decimals0 = uint8(dec0);
        decimals1 = uint8(dec1);

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
        uint256 sqrtK = sqrtK(); // in 2**112

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

    function sqrtK() public view returns (uint256) {
        uint256 totalSupply = lp.totalSupply();
        return Math.sqrt(k()).fdiv(totalSupply);
    }

    function k() public view returns (uint) {
        (uint dec0, uint dec1, uint x, uint y, bool st, , ) = lp.metadata();

        if (st) {
            uint _x = (x * 1e18) / dec0;
            uint _y = (y * 1e18) / dec1;
            uint _a = (_x * _y) / 1e18;
            uint _b = ((_x * _x) / 1e18 + (_y * _y) / 1e18);
            return (_a * _b) / 1e18; // x3y+y3x >= k
        } else {
            return x * y; // xy >= k
        }
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
