import hre from "hardhat";

async function main() {
  console.log("Deploying ArenaToken to Monad testnet...");
  
  const ArenaToken = await hre.ethers.getContractFactory("ArenaToken");
  const token = await ArenaToken.deploy();
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log(`ArenaToken deployed to: ${address}`);
  
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const ownerBalance = await token.balanceOf(await token.owner());
  
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${hre.ethers.formatEther(totalSupply)} TCG`);
  console.log(`Owner Balance: ${hre.ethers.formatEther(ownerBalance)} TCG`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
