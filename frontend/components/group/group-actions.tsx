"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowUpRight, ArrowDownLeft, Check, AlertCircle } from "lucide-react"
import { useAccount } from "wagmi"
import {
  useApproveToken,
  useRotationalDeposit,
  useRotationalDepositAmount,
  useTokenAllowance,
  useTokenBalance,
  useIsRotationalMember,
  useHasDeposited,
  usePoolActive,
  useMintTokens,
  useTargetContribute,
  useTargetWithdraw,
  useFlexibleDeposit,
  useFlexibleWithdraw,
} from "@/hooks/useBaseSafeContracts"

interface GroupActionsProps {
  groupId: string
  poolAddress: string
  poolType: "rotational" | "target" | "flexible"
  tokenAddress: string
}

export function GroupActions({
  groupId,
  poolAddress,
  poolType,
  tokenAddress,
}: GroupActionsProps) {
  const { address } = useAccount()
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showMintHelper, setShowMintHelper] = useState(false)
  
  // Track logged transactions to prevent duplicates
  const loggedTransactions = useRef<Set<string>>(new Set())

  const isRotational = poolType === "rotational"
  const isTarget = poolType === "target"
  const isFlexible = poolType === "flexible"

  // For rotational pools, get depositAmount from contract
  const { depositAmount: contractDepositAmount } = useRotationalDepositAmount(
    isRotational ? poolAddress : "0x0"
  )

  // Check current allowance and balance
  const { allowance } = useTokenAllowance(
    address || "0x0",
    poolAddress
  )
  const { balance: tokenBalance } = useTokenBalance(address || "0x0")

  // For rotational pools, check membership and deposit status
  const { isMember } = useIsRotationalMember(
    isRotational ? poolAddress : "0x0",
    address || "0x0"
  )
  const { hasDeposited: alreadyDeposited } = useHasDeposited(
    isRotational ? poolAddress : "0x0",
    address || "0x0"
  )
  const { active: poolActive } = usePoolActive(
    isRotational ? poolAddress : "0x0"
  )

  // Determine the amount to approve (convert BigInt to ETH string for approval hook)
  const amountToApprove = isRotational && contractDepositAmount
    ? (Number(contractDepositAmount) / 1e18).toString()
    : depositAmount

  // Approval hook
  const approveToken = useApproveToken(poolAddress, amountToApprove || "0")

  // Mint tokens hook (for testnet)
  const mintTokens = useMintTokens("1000") // Mint 1000 tokens

  // Pool-specific hooks
  const rotationalDeposit = useRotationalDeposit(poolAddress)
  const targetContribute = useTargetContribute(poolAddress, depositAmount)
  const targetWithdraw = useTargetWithdraw(poolAddress)
  const flexibleDeposit = useFlexibleDeposit(poolAddress, depositAmount)
  const flexibleWithdraw = useFlexibleWithdraw(poolAddress, withdrawAmount)

  // Set deposit amount for rotational pools from contract
  useEffect(() => {
    if (isRotational && contractDepositAmount) {
      const amount = Number(contractDepositAmount) / 1e18
      setDepositAmount(amount.toString())
    }
  }, [isRotational, contractDepositAmount])

  // Check if already approved
  useEffect(() => {
    if (address && poolAddress && allowance !== undefined) {
      if (isRotational && contractDepositAmount) {
        if (allowance >= contractDepositAmount) {
          setApproved(true)
        } else {
          setApproved(false)
        }
      } else if (depositAmount) {
        const needed = BigInt(Math.floor(Number(depositAmount) * 1e18))
        if (allowance >= needed) {
          setApproved(true)
        } else {
          setApproved(false)
        }
      }
    }
  }, [address, poolAddress, allowance, isRotational, contractDepositAmount, depositAmount])

  // Handle approval success - automatically trigger deposit
  useEffect(() => {
    if (approveToken.isSuccess && !approved) {
      setApproved(true)
      setIsApproving(false)
      // Automatically trigger deposit after approval
      const timer = setTimeout(() => {
        if (isRotational) {
          rotationalDeposit.deposit?.()
        } else if (isTarget) {
          targetContribute.contribute?.()
        } else if (isFlexible) {
          flexibleDeposit.deposit?.()
        }
      }, 1000) // Wait 1 second for approval to be confirmed
      return () => clearTimeout(timer)
    }
  }, [approveToken.isSuccess, approved, isRotational, isTarget, isFlexible, rotationalDeposit.deposit, targetContribute.contribute, flexibleDeposit.deposit])

  // Handle deposit success - log to database and refresh
  useEffect(() => {
    const logDepositActivity = async (txHash: string, amount: string, activityType: string) => {
      if (!txHash) {
        console.error('No transaction hash provided for activity logging')
        return
      }
      
      try {
        console.log('Logging deposit activity:', { poolId: groupId, activityType, amount, txHash, contractAddress: poolAddress })
        
        const response = await fetch('/api/pools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            poolId: groupId,
            activityType: activityType,
            userAddress: address,
            amount: parseFloat(amount),
            txHash: txHash,
            contractAddress: poolAddress, // Add contract address to help find pool if needed
            description: `${activityType} completed`,
          }),
        })
        
        const responseData = await response.json().catch(() => ({}))
        
        if (!response.ok) {
          if (response.status === 503) {
            console.warn('Supabase not configured - activity not logged to database')
          } else {
            console.error('Failed to log activity to database:', response.status, responseData)
            setError(`Deposit successful but failed to log: ${responseData.error || 'Unknown error'}`)
          }
        } else {
          console.log('Activity logged successfully:', responseData)
        }
      } catch (err) {
        console.error('Failed to log activity:', err)
        setError(`Deposit successful but failed to log activity: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    if (rotationalDeposit.isSuccess && rotationalDeposit.hash) {
      const txHash = rotationalDeposit.hash
      if (!loggedTransactions.current.has(txHash)) {
        loggedTransactions.current.add(txHash)
        const amount = contractDepositAmount ? (Number(contractDepositAmount) / 1e18).toString() : depositAmount
        setSuccess(`Deposit successful! Transaction: ${txHash.slice(0, 10)}...`)
        logDepositActivity(txHash, amount, 'deposit')
        setDepositAmount("")
        setApproved(false)
        setError("")
        setShowMintHelper(false)
        // Refresh activity and details after a short delay
        setTimeout(() => {
          window.dispatchEvent(new Event('pool-updated'))
          setSuccess("")
        }, 3000)
      }
    }
    if (targetContribute.isSuccess && targetContribute.hash) {
      const txHash = targetContribute.hash
      if (!loggedTransactions.current.has(txHash)) {
        loggedTransactions.current.add(txHash)
        setSuccess(`Contribution successful! Transaction: ${txHash.slice(0, 10)}...`)
        logDepositActivity(txHash, depositAmount, 'contribute')
        setDepositAmount("")
        setApproved(false)
        setError("")
        setShowMintHelper(false)
        setTimeout(() => {
          window.dispatchEvent(new Event('pool-updated'))
          setSuccess("")
        }, 3000)
      }
    }
    if (flexibleDeposit.isSuccess && flexibleDeposit.hash) {
      const txHash = flexibleDeposit.hash
      if (!loggedTransactions.current.has(txHash)) {
        loggedTransactions.current.add(txHash)
        setSuccess(`Deposit successful! Transaction: ${txHash.slice(0, 10)}...`)
        logDepositActivity(txHash, depositAmount, 'deposit')
        setDepositAmount("")
        setApproved(false)
        setError("")
        setShowMintHelper(false)
        setTimeout(() => {
          window.dispatchEvent(new Event('pool-updated'))
          setSuccess("")
        }, 3000)
      }
    }
  }, [rotationalDeposit.isSuccess, rotationalDeposit.hash, targetContribute.isSuccess, targetContribute.hash, flexibleDeposit.isSuccess, flexibleDeposit.hash, groupId, address, poolAddress, contractDepositAmount, depositAmount])

  // Handle mint success
  useEffect(() => {
    if (mintTokens.isSuccess) {
      setShowMintHelper(false)
      setError("")
    }
  }, [mintTokens.isSuccess])

  // Handle transaction errors
  useEffect(() => {
    if (rotationalDeposit.error) {
      const errorMsg = rotationalDeposit.error.message || "Deposit failed"
      if (errorMsg.includes("InsufficientBalance") || errorMsg.includes("insufficient balance")) {
        setError("Insufficient token balance. Please get tokens first.")
        setShowMintHelper(true)
      } else if (errorMsg.includes("not member")) {
        setError("You are not a member of this pool")
      } else if (errorMsg.includes("already deposited")) {
        setError("You have already deposited in this round")
      } else if (errorMsg.includes("pool inactive")) {
        setError("Pool is inactive")
      } else {
        setError(errorMsg)
      }
      setIsApproving(false)
    }
    if (targetContribute.error) {
      const errorMsg = targetContribute.error.message || "Contribution failed"
      if (errorMsg.includes("InsufficientBalance") || errorMsg.includes("insufficient balance")) {
        setError("Insufficient token balance. Please get tokens first.")
        setShowMintHelper(true)
      } else {
        setError(errorMsg)
      }
      setIsApproving(false)
    }
    if (flexibleDeposit.error) {
      const errorMsg = flexibleDeposit.error.message || "Deposit failed"
      if (errorMsg.includes("InsufficientBalance") || errorMsg.includes("insufficient balance")) {
        setError("Insufficient token balance. Please get tokens first.")
        setShowMintHelper(true)
      } else {
        setError(errorMsg)
      }
      setIsApproving(false)
    }
    if (approveToken.error) {
      setError(approveToken.error.message || "Approval failed")
      setIsApproving(false)
    }
  }, [rotationalDeposit.error, targetContribute.error, flexibleDeposit.error, approveToken.error])


  const handleDeposit = async () => {
    setError("")
    
    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    // For rotational pools, validate prerequisites
    if (isRotational) {
      if (!contractDepositAmount) {
        setError("Loading pool details...")
        return
      }

      if (poolActive === false) {
        setError("Pool is inactive")
        return
      }

      if (isMember === false) {
        setError("You are not a member of this pool")
        return
      }

      if (alreadyDeposited === true) {
        setError("You have already deposited in this round")
        return
      }

      // Check token balance
      if (tokenBalance !== undefined && tokenBalance < contractDepositAmount) {
        const needed = Number(contractDepositAmount) / 1e18
        const current = Number(tokenBalance) / 1e18
        setError(`Insufficient balance. You need ${needed.toFixed(4)} BST but only have ${current.toFixed(4)} BST`)
        setShowMintHelper(true)
        return
      }
    } else {
      // For non-rotational pools, check if amount is entered
      if (!depositAmount) {
        setError("Please enter an amount")
        return
      }

      const needed = BigInt(Math.floor(Number(depositAmount) * 1e18))
      
      // Check token balance
      if (tokenBalance !== undefined && tokenBalance < needed) {
        const current = Number(tokenBalance) / 1e18
        setError(`Insufficient balance. You need ${depositAmount} BST but only have ${current.toFixed(4)} BST`)
        setShowMintHelper(true)
        return
      }
    }

    // Check if already approved
    let needed: bigint
    if (isRotational && contractDepositAmount) {
      needed = contractDepositAmount
    } else if (depositAmount) {
      needed = BigInt(Math.floor(Number(depositAmount) * 1e18))
    } else {
      setError("Invalid amount")
      return
    }

    if (allowance !== undefined && allowance >= needed) {
      // Already approved, proceed with deposit
      try {
        if (isRotational) {
          rotationalDeposit.deposit?.()
        } else if (isTarget) {
          targetContribute.contribute?.()
        } else if (isFlexible) {
          flexibleDeposit.deposit?.()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to deposit")
      }
    } else {
      // Need to approve first
      setIsApproving(true)
      try {
        approveToken.approve?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to approve")
        setIsApproving(false)
      }
    }
  }

  const handleWithdraw = async () => {
    setError("")
    if (!withdrawAmount || !address) {
      setError("Please enter an amount")
      return
    }

    if (poolType === "target") {
      targetWithdraw.withdraw?.()
    } else if (poolType === "flexible") {
      flexibleWithdraw.withdraw?.()
    }
  }

  const isDepositLoading =
    poolType === "rotational"
      ? rotationalDeposit.isLoading
      : poolType === "target"
        ? targetContribute.isLoading
        : flexibleDeposit.isLoading

  const isWithdrawLoading =
    poolType === "target"
      ? targetWithdraw.isLoading
      : flexibleWithdraw.isLoading

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

      {/* Token Balance Display */}
      {tokenBalance !== undefined && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Your Token Balance</p>
          <p className="text-lg font-semibold">
            {(Number(tokenBalance) / 1e18).toFixed(4)} BST
          </p>
          {tokenBalance === BigInt(0) && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMintHelper(!showMintHelper)}
                className="w-full"
              >
                {mintTokens.isOwner ? "Get Test Tokens" : "Need Tokens?"}
              </Button>
              {showMintHelper && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-xs">
                  {mintTokens.isOwner ? (
                    <div>
                      <p className="mb-2">You're the token owner. Click below to mint test tokens:</p>
                      <Button
                        size="sm"
                        onClick={() => mintTokens.mint()}
                        disabled={mintTokens.isLoading}
                        className="w-full"
                      >
                        {mintTokens.isLoading ? "Minting..." : "Mint 1000 Test Tokens"}
                      </Button>
                    </div>
                  ) : (
                    <p>
                      You need tokens to deposit. Contact the token owner or get tokens from a faucet.
                      Token Address: <span className="font-mono text-xs">{tokenAddress.slice(0, 10)}...</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="flex gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
          <Check className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{error}</p>
            {error.includes("Insufficient balance") && tokenBalance !== undefined && (
              <p className="text-xs mt-1">
                Current balance: {(Number(tokenBalance) / 1e18).toFixed(4)} BST
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* DEPOSIT SECTION */}
        <div className="space-y-3">
          <Label htmlFor="deposit">
            {isRotational
              ? "Deposit Fixed Amount (ETH)"
              : isTarget
                ? "Contribute Amount (ETH)"
                : "Deposit Amount (ETH)"}
          </Label>
          <Input
            id="deposit"
            type="number"
            step="0.01"
            placeholder={isRotational ? "Loading..." : "0.5"}
            value={depositAmount}
            onChange={(e) => !isRotational && setDepositAmount(e.target.value)}
            disabled={isDepositLoading || isApproving || isRotational}
            readOnly={isRotational}
          />
          <p className="text-xs text-muted-foreground">
            {isRotational &&
              "Deposit the fixed pool amount. Same amount for all members."}
            {isTarget && "Contribute any amount toward the target goal."}
            {isFlexible &&
              "Deposit any amount (must meet minimum). Withdraw anytime."}
          </p>
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleDeposit}
            disabled={isDepositLoading || isApproving || (!depositAmount && !isRotational) || !address}
          >
            {isDepositLoading || isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {approved ? "Depositing..." : "Approving..."}
              </>
            ) : approved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isRotational ? "Deposit" : isTarget ? "Contribute" : "Deposit"}
              </>
            ) : (
              <>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                {isRotational ? "Deposit" : isTarget ? "Contribute" : "Deposit"}
              </>
            )}
          </Button>
        </div>

        {/* WITHDRAW SECTION */}
        {!isRotational && (
          <div className="border-t border-border pt-6 space-y-3">
            <Label htmlFor="withdraw">
              {isTarget ? "Withdraw Share (ETH)" : "Withdraw Amount (ETH)"}
            </Label>
            <Input
              id="withdraw"
              type="number"
              step="0.01"
              placeholder="0.5"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isWithdrawLoading}
            />
            <p className="text-xs text-muted-foreground">
              {isTarget &&
                "Withdraw after target reached or deadline passed."}
              {isFlexible && "Withdraw anytime. Exit fee will be deducted."}
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleWithdraw}
              disabled={isWithdrawLoading || !withdrawAmount || !address}
            >
              {isWithdrawLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        )}

        {isRotational && (
          <div className="border-t border-border pt-6 bg-blue-50 dark:bg-blue-950 p-3 rounded">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Rotational Pool:</strong> No direct withdrawals.
              Payouts are automatic when your turn comes. A relayer triggers
              payouts on schedule.
            </p>
          </div>
        )}

        {/* WALLET INFO */}
        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground mb-2">Your wallet</p>
          <p className="text-sm font-mono bg-muted/30 p-2 rounded break-all">
            {address || "Not connected"}
          </p>
        </div>
      </div>
    </Card>
  )
}
