import pkg from "hardhat";
const { ethers, upgrades } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ArenaToken (UUPS proxy) with:", deployer.address);

  const ArenaToken = await ethers.getContractFactory("ArenaToken");
  const token = await upgrades.deployProxy(ArenaToken, [deployer.address], {
    initializer: "initialize",
    kind: "uups",
  });

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log("ArenaToken proxy deployed to:", address);
  console.log("Implementation deployed behind proxy");

  const symbol = await token.symbol();
  const name = await token.name();
  const supply = await token.totalSupply();
  console.log(`Name: ${name}, Symbol: ${symbol}, Supply: ${ethers.formatEther(supply)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
