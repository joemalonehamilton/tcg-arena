// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TCGCards is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    // Card metadata stored on-chain for permanence
    struct Card {
        string name;
        string rarity;
        uint8 grade;
        string packType;
    }

    mapping(uint256 => Card) public cards;

    event CardMinted(uint256 indexed tokenId, address indexed to, string name, string rarity, uint8 grade);

    constructor(string memory baseURI) ERC721("TCG Arena Cards", "TCGCARD") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function mint(address to, string calldata name, string calldata rarity, uint8 grade, string calldata packType) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        cards[tokenId] = Card(name, rarity, grade, packType);
        emit CardMinted(tokenId, to, name, rarity, grade);
        return tokenId;
    }

    function mintBatch(address to, string[] calldata names, string[] calldata rarities, uint8[] calldata grades, string calldata packType) external onlyOwner returns (uint256[] memory) {
        require(names.length == rarities.length && names.length == grades.length, "Length mismatch");
        uint256[] memory tokenIds = new uint256[](names.length);
        for (uint256 i = 0; i < names.length; i++) {
            uint256 tokenId = _nextTokenId++;
            _mint(to, tokenId);
            cards[tokenId] = Card(names[i], rarities[i], grades[i], packType);
            emit CardMinted(tokenId, to, names[i], rarities[i], grades[i]);
            tokenIds[i] = tokenId;
        }
        return tokenIds;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, _toString(tokenId)));
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits--; buffer[digits] = bytes1(uint8(48 + value % 10)); value /= 10; }
        return string(buffer);
    }
}
