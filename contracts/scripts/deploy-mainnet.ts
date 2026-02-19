import { Wallet, JsonRpcProvider, ContractFactory } from 'ethers'
import { readFileSync } from 'fs'

async function main() {
  const provider = new JsonRpcProvider('https://rpc.monad.xyz')
  const wallet = new Wallet('0xcbb6138c08edc8e10dbac9c1d4f94b3f2cdbca4ea6077caca71bac6130e48004', provider)
  
  console.log('Deployer:', wallet.address)

  const artifact = JSON.parse(readFileSync('artifacts/contracts/SeasonSeal.sol/SeasonSeal.json', 'utf8'))
  
  console.log('Deploying SeasonSeal...')
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet)
  const tx = await factory.getDeployTransaction()
  
  // Send manually with explicit gas
  const sentTx = await wallet.sendTransaction({
    ...tx,
    gasLimit: 2000000n,
  })
  console.log('TX hash:', sentTx.hash)
  console.log('Waiting for confirmation...')
  
  const receipt = await sentTx.wait(1)
  console.log('Contract:', receipt?.contractAddress)
  console.log('Block:', receipt?.blockNumber)
  console.log('Status:', receipt?.status)
}

main().catch(console.error)
