import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SeasonSeal with account:", deployer.address);

  const SeasonSeal = await ethers.getContractFactory("SeasonSeal");
  const contract = await SeasonSeal.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SeasonSeal deployed to:", address);
  console.log("Owner:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
