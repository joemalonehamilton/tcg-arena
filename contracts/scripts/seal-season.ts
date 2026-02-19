import pkg from "hardhat";
const { ethers } = pkg;

const CONTRACT_ADDRESS = "0x5900E83003F6c3Dc13f0fD719EB161ffB4974f80";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Sealing Season 01 with account:", deployer.address);

  const SeasonSeal = await ethers.getContractAt("SeasonSeal", CONTRACT_ADDRESS);

  // Hash of all 18 Season 01 card names
  const cards = [
    "Nadzilla", "Blob Validator", "Phantom Finalizer", "Gremlin MEV",
    "Monadium", "Octoracle", "Gas Guzzler", "Shard Wyrm",
    "Mempool Lurker", "BFT Crab", "Block Bunny", "The Devnet Horror",
    "Rugpull Dragon", "The Deployer", "Frozen Liquidity", "Whale",
    "Dead Cat Bounce", "Rug Walker"
  ];

  const cardSetHash = ethers.keccak256(ethers.toUtf8Bytes(cards.join(",")));
  console.log("Card set hash:", cardSetHash);

  const tx = await SeasonSeal.seal(
    cardSetHash,
    "ipfs://tcg-arena-season-01", // placeholder IPFS URI
    5,  // 5 agents
    18  // 18 cards
  );

  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("Season 01 sealed on-chain! ✅");

  // Verify
  const season = await SeasonSeal.getSeason(0);
  console.log("Sealed season:", {
    cardSetHash: season.cardSetHash,
    ipfsURI: season.ipfsURI,
    timestamp: season.timestamp.toString(),
    agentCount: season.agentCount.toString(),
    cardCount: season.cardCount.toString(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
