//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockAggregator is Ownable {
    int256 private _latestAnswer;

    event AnswerUpdated(
        int256 indexed current,
        uint256 indexed roundId,
        uint256 updatedAt
    );

    constructor(int256 initialAnswer) Ownable(msg.sender) {
        _latestAnswer = initialAnswer;
        emit AnswerUpdated(initialAnswer, 0, block.timestamp);
    }

    function latestAnswer() external view returns (int256) {
        return _latestAnswer;
    }

    function updateAnswer(int256 answer) external onlyOwner {
        _latestAnswer = answer;
        emit AnswerUpdated(answer, 0, block.timestamp);
    }

    function getTokenType() external pure returns (uint256) {
        return 1;
    }

    function decimals() external pure returns (uint8) {
        return 8;
    }
}
