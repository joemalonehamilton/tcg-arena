'use client'

import { useAccount, useReadContract } from 'wagmi'
import { TCG_TOKEN_ADDRESS, TCG_TOKEN_ABI } from '@/lib/tcg-token'
import { monadMainnet } from '@/lib/wagmi-config'

export function useTCGBalance() {
  const { address, isConnected } = useAccount()

  const { data: rawBalance, refetch, isLoading } = useReadContract({
    address: TCG_TOKEN_ADDRESS,
    abi: TCG_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: monadMainnet.id,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000,
    },
  })

  const balance = rawBalance ? Number(rawBalance / BigInt(10 ** 18)) : 0

  return { balance, rawBalance, refetch, isLoading, isConnected, address }
}
