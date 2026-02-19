// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title SeasonSeal (UUPS Upgradeable)
 * @notice Anchors TCG Arena season card set hashes on Monad.
 * @dev Minimal, gas-efficient, auditable. Only owner can seal.
 */
contract SeasonSeal is Initializable, OwnableUpgradeable, UUPSUpgradeable {

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
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

    /// @dev Required override for UUPS — only owner can upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
