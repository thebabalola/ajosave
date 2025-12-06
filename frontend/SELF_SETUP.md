# Self.xyz Integration Setup Guide

This guide explains how to set up Self.xyz identity verification for the AjoSave platform.

## Prerequisites

1. A wallet with Celo Sepolia testnet funds
2. Access to Self.xyz API (playground or production)
3. Wagmi/Reown AppKit configured

## Environment Variables

Create a `.env.local` file in the `frontend` directory with the following:

```env
# Self Protocol Configuration
NEXT_PUBLIC_SELF_ENDPOINT=https://playground.self.xyz/api/verify
NEXT_PUBLIC_SELF_VERIFICATION_HUB_ADDRESS=0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
NEXT_PUBLIC_SELF_APP_NAME=AjoSave
NEXT_PUBLIC_SELF_SCOPE=ajosave-savings
NEXT_PUBLIC_SELF_MIN_AGE=18
NEXT_PUBLIC_SELF_EXCLUDED_COUNTRIES=IRN,PRK,RUS,SYR
NEXT_PUBLIC_SELF_OFAC=true
```

## How It Works

1. User connects wallet via Reown AppKit
2. User clicks "Verify Identity" in profile page
3. QR code displays for Self app scanning
4. User scans with Self app and completes verification
5. Proof is stored locally and can be submitted onchain
6. Verified badge appears in profile and dashboard header

## Features

- Zero-knowledge proof based identity verification
- Onchain proof submission to Self VerificationHub
- Local storage of verification state
- Visual verification badge in UI
- Secure and privacy-preserving

## Testing

To test the integration:

1. Install and run the app: `npm run dev`
2. Connect your wallet
3. Navigate to Dashboard > Profile tab
4. Click "Verify Identity" 
5. Scan QR code with Self app (use playground endpoint for testing)
6. Complete verification
7. Check for verified badge in profile and header

## Network Configuration

The app defaults to Celo Sepolia testnet. Self VerificationHub is deployed at:

- Testnet (Celo Sepolia): `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`
- Mainnet: `0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF`

## Resources

- [Self.xyz Documentation](https://docs.self.xyz)
- [Reown AppKit Documentation](https://docs.reown.com)
- [Celo Documentation](https://docs.celo.org)

