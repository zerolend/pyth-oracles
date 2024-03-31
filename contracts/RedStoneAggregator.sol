//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

interface IRedstoneConsumer {
    function getTimestampsFromLatestUpdate()
        external
        view
        returns (uint128 dataTimestamp, uint128 blockTimestamp);

    function getValueForDataFeed(
        bytes32 dataFeedId
    ) external view returns (uint256);
}

contract RedStoneAggregator {
    bytes32 public priceId;
    IRedstoneConsumer public consumer;

    constructor(address _consumer, bytes32 _priceId) {
        priceId = _priceId;
        consumer = IRedstoneConsumer(_consumer);
    }

    function decimals() public view virtual returns (uint8) {
        return 8;
    }

    function description() public pure returns (string memory) {
        return "A port of a chainlink aggregator powered by redstone feeds";
    }

    function version() public pure returns (uint256) {
        return 1;
    }

    function latestAnswer() public view virtual returns (int256) {
        return int256(consumer.getValueForDataFeed(priceId));
    }

    function latestTimestamp() public view returns (uint256) {
        (uint128 dataTimestamp, ) = consumer.getTimestampsFromLatestUpdate();
        return dataTimestamp;
    }

    function latestRound() public view returns (uint256) {
        // use timestamp as the round id
        return latestTimestamp();
    }

    function getAnswer(uint256) public view returns (int256) {
        return latestAnswer();
    }

    function getTimestamp(uint256) external view returns (uint256) {
        return latestTimestamp();
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
        return (
            _roundId,
            latestAnswer(),
            latestTimestamp(),
            latestTimestamp(),
            _roundId
        );
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
        return (
            roundId,
            latestAnswer(),
            latestTimestamp(),
            latestTimestamp(),
            roundId
        );
    }
}
