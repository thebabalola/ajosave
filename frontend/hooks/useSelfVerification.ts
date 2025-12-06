"use client";

import { useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";

/**
 * Self IdentityVerificationHub ABI
 * Contract addresses:
 * - Mainnet: 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF
 * - Testnet (Celo Sepolia): 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
 */
const VERIFICATION_HUB_ABI = parseAbi([
  "function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData) external",
]);

interface UseSelfVerificationProps {
  verificationHubAddress?: `0x${string}`;
}

/**
 * Hook for submitting Self verification proofs to onchain contracts
 */
export function useSelfVerification({
  verificationHubAddress,
}: UseSelfVerificationProps = {}) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Submit verification proof to Self VerificationHub
   * @param proofData - The proof data from Self verification
   */
  const submitToVerificationHub = useCallback(
    async (proofData: {
      proof: any;
      publicSignals: any[];
      userContextData: string;
    }) => {
      if (!verificationHubAddress || !address) {
        throw new Error("VerificationHub address or wallet address not set");
      }

      // Encode proof payload according to Self's VerificationHub format
      const proofPayload = JSON.stringify({
        proof: proofData.proof,
        publicSignals: proofData.publicSignals,
      });
      
      // Convert to hex string
      const proofBytes = `0x${Buffer.from(proofPayload).toString("hex")}` as `0x${string}`;
      
      // Ensure userContextData is hex format
      const userContextDataHex = proofData.userContextData.startsWith("0x")
        ? (proofData.userContextData as `0x${string}`)
        : (`0x${proofData.userContextData}` as `0x${string}`);

      try {
        await writeContract({
          address: verificationHubAddress,
          abi: VERIFICATION_HUB_ABI,
          functionName: "verifySelfProof",
          args: [proofBytes, userContextDataHex],
        });
      } catch (err) {
        console.error("Failed to submit to VerificationHub:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        throw new Error(`Verification submission failed: ${errorMessage}`);
      }
    },
    [verificationHubAddress, address, writeContract]
  );

  return {
    submitToVerificationHub,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

