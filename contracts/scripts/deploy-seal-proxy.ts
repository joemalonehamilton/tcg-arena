import pkg from "hardhat";
const { ethers, upgrades } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SeasonSeal (UUPS proxy) with:", deployer.address);

  const SeasonSeal = await ethers.getContractFactory("SeasonSeal");
  const seal = await upgrades.deployProxy(SeasonSeal, [deployer.address], {
    initializer: "initialize",
    kind: "uups",
  });

  await seal.waitForDeployment();
  const address = await seal.getAddress();

  console.log("SeasonSeal proxy deployed to:", address);
  console.log("Implementation deployed behind proxy");
  
  const total = await seal.totalSeasons();
  console.log("Total seasons:", total.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
