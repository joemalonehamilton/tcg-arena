// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SeasonSeal
 * @notice Anchors TCG Arena season card set hashes on Monad.
 * @dev Minimal, gas-efficient, auditable. Only owner can seal.
 */
contract SeasonSeal {
    address public immutable owner;

    struct Season {
        bytes32 cardSetHash;
        string ipfsURI;
        uint256 timestamp;
        uint256 agentCount;
        uint256 cardCount;
    }

    Season[] private _seasons;

    event SeasonSealed(
        uint256 indexed seasonId,
        bytes32 cardSetHash,
        string ipfsURI,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function seal(
        bytes32 cardSetHash,
        string calldata ipfsURI,
        uint256 agentCount,
        uint256 cardCount
    ) external onlyOwner returns (uint256 seasonId) {
        seasonId = _seasons.length;
        _seasons.push(Season({
            cardSetHash: cardSetHash,
            ipfsURI: ipfsURI,
            timestamp: block.timestamp,
            agentCount: agentCount,
            cardCount: cardCount
        }));
        emit SeasonSealed(seasonId, cardSetHash, ipfsURI, block.timestamp);
    }

    function getSeason(uint256 seasonId) external view returns (Season memory) {
        require(seasonId < _seasons.length, "Season not found");
        return _seasons[seasonId];
    }

    function totalSeasons() external view returns (uint256) {
        return _seasons.length;
    }
}
