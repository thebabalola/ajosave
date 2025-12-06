"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useSelfVerification } from "./useSelfVerification";
import { CONTRACTS } from "@/config/contracts";

export type SelfIdProfile = {
  handle: string;
  reputationScore: number;
  attestations: number;
  verificationData?: {
    attestationId: number;
    proof: any;
    publicSignals: any[];
    userContextData: string;
    credentialSubject?: any;
  };
};

export function useSelfId() {
  const { address } = useAccount();
  
  const [profile, setProfile] = useState<SelfIdProfile | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isSubmittingOnchain, setIsSubmittingOnchain] = useState(false);

  // Hook for onchain verification
  const {
    submitToVerificationHub,
    isPending: isVerificationPending,
    isConfirming: isVerificationConfirming,
    isSuccess: isVerificationSuccess,
    error: verificationError,
  } = useSelfVerification({
    verificationHubAddress: CONTRACTS.SELF_VERIFICATION_HUB,
  });

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && address) {
      const stored = localStorage.getItem(`self_profile_${address}`);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to load stored profile:", e);
        }
      }
    }
  }, [address]);

  const linkSelfId = useCallback(() => {
    console.log("🟢 linkSelfId called", { isLinking, address });
    if (isLinking || !address) {
      console.log("⚠️ Blocked: isLinking or no address");
      return;
    }
    console.log("✅ Setting verification modal to show");
    setIsLinking(true);
    setShowVerification(true);
  }, [isLinking, address]);

  const handleVerificationSuccess = useCallback(
    async (result: any) => {
      if (!address) return;

      try {
        const verificationData = {
          attestationId: result.attestationId,
          proof: result.proof,
          publicSignals: result.publicSignals,
          userContextData: result.userContextData,
          credentialSubject: result.credentialSubject,
        };

        // Generate handle from wallet address
        const handle = `${address.slice(0, 6)}...${address.slice(-4)}`;
        const reputationScore = 100;

        const newProfile: SelfIdProfile = {
          handle,
          reputationScore,
          attestations: 1,
          verificationData,
        };

        setProfile(newProfile);
        setShowVerification(false);
        setIsLinking(false);

        if (typeof window !== "undefined") {
          localStorage.setItem(`self_profile_${address}`, JSON.stringify(newProfile));
        }

        console.log("✅ Verification proof ready for onchain submission:", {
          attestationId: result.attestationId,
          hasProof: !!result.proof,
          hasPublicSignals: !!result.publicSignals,
        });
        
        setIsSubmittingOnchain(true);
      } catch (error) {
        console.error("Failed to process verification result:", error);
        setIsLinking(false);
        setShowVerification(false);
      }
    },
    [address]
  );

  const handleVerificationError = useCallback((error: Error) => {
    console.error("Verification error:", error);
    setIsLinking(false);
    setShowVerification(false);
  }, []);

  const unlinkSelfId = useCallback(() => {
    if (!address) return;
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`self_profile_${address}`);
    }
  }, [address]);

  const status = useMemo(
    () => ({
      isLinked: Boolean(profile),
      handle: profile?.handle,
      reputationScore: profile?.reputationScore ?? 0,
      attestations: profile?.attestations ?? 0,
      verificationData: profile?.verificationData,
    }),
    [profile]
  );

  const submitProofOnchain = useCallback(
    async (verificationData: SelfIdProfile["verificationData"]) => {
      if (!verificationData || !address) return;

      try {
        setIsSubmittingOnchain(true);

        await submitToVerificationHub({
          proof: verificationData.proof,
          publicSignals: verificationData.publicSignals,
          userContextData: verificationData.userContextData,
        });
      } catch (error) {
        console.error("Failed to submit proof onchain:", error);
        throw error;
      } finally {
        setIsSubmittingOnchain(false);
      }
    },
    [address, submitToVerificationHub]
  );

  return {
    ...status,
    isLinking,
    showVerification,
    isSubmittingOnchain,
    isVerificationPending,
    isVerificationConfirming,
    isVerificationSuccess,
    verificationError,
    linkSelfId,
    unlinkSelfId,
    handleVerificationSuccess,
    handleVerificationError,
    setShowVerification,
    submitProofOnchain,
  };
}

