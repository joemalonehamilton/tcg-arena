// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title ArenaToken — TCG Arena's in-game currency (UUPS Upgradeable)
 * @dev ERC-20 with owner-only minting, deployed behind a UUPS proxy
 */
contract ArenaToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init("TCG Arena", "TCG");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();

        // Mint initial supply to owner (1M TCG for liquidity / game operations)
        _mint(initialOwner, 1_000_000 * 10 ** decimals());
    }

    /// @notice Mint new tokens — owner only
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Batch mint to multiple players
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Length mismatch");
        for (uint i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /// @dev Required override for UUPS — only owner can upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
