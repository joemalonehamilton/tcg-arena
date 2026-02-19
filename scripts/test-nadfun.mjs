import { initSDK, parseEther, formatEther } from '@nadfun/sdk'
import * as fs from 'fs'

const nadSDK = initSDK({
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  privateKey: '0xcbb6138c08edc8e10dbac9c1d4f94b3f2cdbca4ea6077caca71bac6130e48004',
  network: 'testnet',
})

console.log('Account:', nadSDK.account.address)

// Check balance
const feeConfig = await nadSDK.getFeeConfig()
console.log('Deploy fee:', formatEther(feeConfig.deployFeeAmount), 'MON')

// Create token — pass image as Buffer, all metadata inline
console.log('\n--- Creating Nadzilla token on nad.fun ---')
try {
  const imageBuffer = fs.readFileSync('./public/cards/nadzilla.jpg')
  console.log('Image buffer:', imageBuffer.length, 'bytes, type:', typeof imageBuffer, 'isBuffer:', Buffer.isBuffer(imageBuffer))

  const result = await nadSDK.createToken({
    name: 'Nadzilla',
    symbol: 'NADZ',
    description: 'TCG Arena Season 01 Winner — The King of Monad. Mythic rarity. 10/8 stats. Sealed on-chain at 0x802256406a0108D9E04Db52fa8E458D5c25f407B. Play at tcg-arena-one.vercel.app',
    image: imageBuffer,
    imageContentType: 'image/jpeg',
    website: 'https://tcg-arena-one.vercel.app',
    twitter: '',
    telegram: '',
    initialBuyAmount: parseEther('0'), // no initial buy
  })

  console.log('\n🎉 TOKEN CREATED!')
  console.log(JSON.stringify(result, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2))
} catch (e) {
  console.error('Error:', e.message)
  if (e.shortMessage) console.error('Short:', e.shortMessage)
  if (e.details) console.error('Details:', e.details)
}
