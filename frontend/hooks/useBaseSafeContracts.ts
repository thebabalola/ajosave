import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { useEffect, useState } from 'react'

// Import ABIs as const
const FACTORY_ABI = [
  {
    name: 'createRotational',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'depositAmount', type: 'uint256' },
      { name: 'roundDuration', type: 'uint256' },
      { name: 'treasuryFeeBps', type: 'uint256' },
      { name: 'relayerFeeBps', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'createTarget',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'targetAmount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'treasuryFeeBps', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'createFlexible',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'minimumDeposit', type: 'uint256' },
      { name: 'withdrawalFeeBps', type: 'uint256' },
      { name: 'yieldEnabled', type: 'bool' },
      { name: 'treasuryFeeBps', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

const ROTATIONAL_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'depositAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'isMember',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'who', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'hasDeposited',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'active',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

const TARGET_ABI = [
  {
    name: 'contribute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const

const FLEXIBLE_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0xa71C861930C0973AE57c577aC19EB7f11e7d74a6') as `0x${string}`
const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x24642ffABF43D4bd33e1E883A23E10DdFde186c6') as `0x${string}`

// Helper to extract pool address from transaction receipt
async function extractPoolAddress(publicClient: any, txHash: `0x${string}`): Promise<string | null> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash })
    
    if (!receipt || !receipt.logs || receipt.logs.length === 0) return null

    for (const log of receipt.logs) {
      try {
        // Check if this log is from the factory
        if (log.address.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) continue

        // The pool address is indexed and appears in topics[1]
        // Event signature is topics[0], pool address is topics[1], creator is topics[2]
        if (log.topics.length >= 2) {
          // Extract address from topic (remove 0x and take last 40 hex chars = 20 bytes)
          const poolAddr = '0x' + log.topics[1].slice(-40)
          if (poolAddr.match(/^0x[a-fA-F0-9]{40}$/)) {
            return poolAddr
          }
        }
      } catch (e) {
        continue
      }
    }
  } catch (err) {
    console.error('Failed to extract pool address:', err)
  }
  
  return null
}

// Approve token spending
export function useApproveToken(spender: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending, error: writeError } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const approve = () => {
    try {
      writeContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, parsedAmount],
      })
    } catch (err) {
      console.error('Approve error:', err)
    }
  }

  return {
    approve,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    error: writeError,
  }
}

// ROTATIONAL POOL HOOKS
export function useRotationalDeposit(poolAddress: string) {
  const { writeContract, data, isPending, error: writeError } = useWriteContract()
  const { isLoading: isWaiting, isSuccess, data: receipt } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const deposit = () => {
    try {
      writeContract({
        address: poolAddress as `0x${string}`,
        abi: ROTATIONAL_ABI,
        functionName: 'deposit',
      })
    } catch (err) {
      console.error('Deposit error:', err)
    }
  }

  return {
    deposit,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data || receipt?.transactionHash,
    error: writeError,
  }
}

// Hook to read depositAmount from rotational pool
export function useRotationalDepositAmount(poolAddress: string) {
  const { data, isLoading, error } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: ROTATIONAL_ABI,
    functionName: 'depositAmount',
    query: {
      enabled: !!poolAddress,
    },
  })

  return {
    depositAmount: data,
    isLoading,
    error,
  }
}

// Hook to check token allowance
export function useTokenAllowance(owner: string, spender: string) {
  const { data, isLoading, error } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner as `0x${string}`, spender as `0x${string}`],
    query: {
      enabled: !!owner && !!spender,
    },
  })

  return {
    allowance: data,
    isLoading,
    error,
  }
}

// Hook to check token balance
export function useTokenBalance(account: string) {
  const { data, isLoading, error } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [account as `0x${string}`],
    query: {
      enabled: !!account,
    },
  })

  return {
    balance: data,
    isLoading,
    error,
  }
}

// Hook to check if user is member of rotational pool
export function useIsRotationalMember(poolAddress: string, userAddress: string) {
  const { data, isLoading, error } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: ROTATIONAL_ABI,
    functionName: 'isMember',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!poolAddress && !!userAddress,
    },
  })

  return {
    isMember: data,
    isLoading,
    error,
  }
}

// Hook to check if user has already deposited in rotational pool
export function useHasDeposited(poolAddress: string, userAddress: string) {
  const { data, isLoading, error } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: ROTATIONAL_ABI,
    functionName: 'hasDeposited',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!poolAddress && !!userAddress,
    },
  })

  return {
    hasDeposited: data,
    isLoading,
    error,
  }
}

// Hook to check if pool is active
export function usePoolActive(poolAddress: string) {
  const { data, isLoading, error } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: ROTATIONAL_ABI,
    functionName: 'active',
    query: {
      enabled: !!poolAddress,
    },
  })

  return {
    active: data,
    isLoading,
    error,
  }
}

// Hook to mint tokens (for testnet/owner only)
export function useMintTokens(amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)
  const { address } = useAccount()
  const { writeContract, data, isPending, error: writeError } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'owner',
    query: {
      enabled: !!address,
    },
  })

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase()

  const mint = () => {
    if (!address) {
      throw new Error("Please connect your wallet")
    }
    if (!isOwner) {
      throw new Error("Only token owner can mint")
    }
    try {
      writeContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [address as `0x${string}`, parsedAmount],
      })
    } catch (err) {
      console.error('Mint error:', err)
    }
  }

  return {
    mint,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    error: writeError,
    isOwner,
  }
}

// TARGET POOL HOOKS
export function useTargetContribute(poolAddress: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const contribute = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: TARGET_ABI,
      functionName: 'contribute',
      args: [parsedAmount],
    })
  }

  return {
    contribute,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

export function useTargetWithdraw(poolAddress: string) {
  const { writeContract, data, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const withdraw = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: TARGET_ABI,
      functionName: 'withdraw',
    })
  }

  return {
    withdraw,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// FLEXIBLE POOL HOOKS
export function useFlexibleDeposit(poolAddress: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const deposit = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: FLEXIBLE_ABI,
      functionName: 'deposit',
      args: [parsedAmount],
    })
  }

  return {
    deposit,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

export function useFlexibleWithdraw(poolAddress: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const withdraw = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: FLEXIBLE_ABI,
      functionName: 'withdraw',
      args: [parsedAmount],
    })
  }

  return {
    withdraw,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// FACTORY HOOKS - UPDATED WITH POOL ADDRESS EXTRACTION
export function useCreateRotational(
  members: string[],
  depositAmount: string,
  frequency: string,
  treasuryFeeBps: number,
  relayerFeeBps: number
) {
  const frequencyMap: Record<string, number> = {
    daily: 86400,
    weekly: 604800,
    biweekly: 1209600,
    monthly: 2592000,
  }

  const roundDuration = frequencyMap[frequency] || 604800
  const parsedAmount = depositAmount ? parseEther(depositAmount) : BigInt(0)

  const { writeContract, data, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })
  
  const publicClient = usePublicClient()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)

  useEffect(() => {
    if (isSuccess && data && publicClient) {
      extractPoolAddress(publicClient, data).then(addr => {
        setPoolAddress(addr)
      })
    }
  }, [isSuccess, data, publicClient])

  const create = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createRotational',
      args: [
        members.map((m) => m as `0x${string}`),
        parsedAmount,
        BigInt(roundDuration),
        BigInt(treasuryFeeBps),
        BigInt(relayerFeeBps),
      ],
    })
  }

  return {
    create,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    poolAddress,
  }
}

export function useCreateTarget(
  members: string[],
  targetAmount: string,
  deadline: Date,
  treasuryFeeBps: number
) {
  const parsedAmount = targetAmount ? parseEther(targetAmount) : BigInt(0)
  const deadlineTimestamp = Math.floor(deadline.getTime() / 1000)

  const { writeContract, data, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })
  
  const publicClient = usePublicClient()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)

  useEffect(() => {
    if (isSuccess && data && publicClient) {
      extractPoolAddress(publicClient, data).then(addr => {
        setPoolAddress(addr)
      })
    }
  }, [isSuccess, data, publicClient])

  const create = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createTarget',
      args: [
        members.map((m) => m as `0x${string}`),
        parsedAmount,
        BigInt(deadlineTimestamp),
        BigInt(treasuryFeeBps),
      ],
    })
  }

  return {
    create,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    poolAddress,
  }
}

export function useCreateFlexible(
  members: string[],
  minimumDeposit: string,
  withdrawalFee: string,
  yieldEnabled: boolean,
  treasuryFeeBps: number
) {
  const parsedMinimum = minimumDeposit ? parseEther(minimumDeposit) : BigInt(0)
  const withdrawalFeeBps = Math.floor(Number(withdrawalFee) * 100)

  const { writeContract, data, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })
  
  const publicClient = usePublicClient()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)

  useEffect(() => {
    if (isSuccess && data && publicClient) {
      extractPoolAddress(publicClient, data).then(addr => {
        setPoolAddress(addr)
      })
    }
  }, [isSuccess, data, publicClient])

  const create = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createFlexible',
      args: [
        members.map((m) => m as `0x${string}`),
        parsedMinimum,
        BigInt(withdrawalFeeBps),
        yieldEnabled,
        BigInt(treasuryFeeBps),
      ],
    })
  }

  return {
    create,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    poolAddress,
  }
}