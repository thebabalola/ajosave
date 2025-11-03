# Deployment Summary

This document contains the deployment addresses for BaseSafeFactory contracts on different networks.

## Celo Sepolia Testnet

**Network**: Celo Sepolia (Chain ID: 11142220)  
**Deployment Date**: Latest  
**Status**: ✅ Deployed & Verified

### Contract Addresses

| Contract | Address |
|----------|---------|
| **BaseToken** | `0x24642ffABF43D4bd33e1E883A23E10DdFde186c6` |
| **BaseSafeFactory** | `0xa71C861930C0973AE57c577aC19EB7f11e7d74a6` |
| **Treasury** | `0xa91D5A0a64ED5eeF11c4359C4631279695A338ef` |

### Token Details

- **Name**: Base Safe Token
- **Symbol**: BST
- **Network**: Celo Sepolia

### Transaction Details

- **BaseToken Deployment**:
  - Hash: `0x4b7267a5e9df420d78c1f30f3f33ff7fbf2aa23179e4421d63a91cdb96df06ae`
  - Block: 8846676
  - Gas Used: 1,117,391
  - Gas Price: 25.000000001 gwei
  - Cost: 0.027934775001117391 CELO

- **BaseSafeFactory Deployment**:
  - Hash: `0x60b5a40b6f77d3662f2645aa54e082afc38506a7002da2e412a9d23c499913b1`
  - Block: 8846677
  - Gas Used: 6,965,015
  - Gas Price: 25.000000001 gwei
  - Cost: 0.174125375006965015 CELO

**Total Deployment Cost**: 0.202060150008082406 CELO

### Verification

Both contracts were successfully verified on Sourcify:
- **BaseToken**: ✅ Verified (`exact_match`)
- **BaseSafeFactory**: ✅ Verified (`exact_match`)

---

## Base Sepolia Testnet

**Network**: Base Sepolia (Chain ID: 84532)  
**Deployment Date**: Latest  
**Status**: ✅ Deployed & Verified

### Contract Addresses

| Contract | Address |
|----------|---------|
| **BaseToken** | `0xa71C861930C0973AE57c577aC19EB7f11e7d74a6` |
| **BaseSafeFactory** | `0xCF4078f1c5C5e051Ae2442e5758b6Eaf548AD780` |
| **Treasury** | `0xa91D5A0a64ED5eeF11c4359C4631279695A338ef` |

### Token Details

- **Name**: Base Safe Token
- **Symbol**: BST
- **Network**: Base Sepolia

### Transaction Details

- **BaseToken Deployment**:
  - Hash: `0xd4ffcb160396d6eca138fa4aa28524ab60f0368fb0b8109011790a601b291867`
  - Block: 33181489
  - Gas Used: 687,884
  - Gas Price: 0.001000108 gwei
  - Cost: 0.000000687958291472 ETH

- **BaseSafeFactory Deployment**:
  - Hash: `0xa2f6300fb3c09373dd6b22ab65370634b6b3f05403d4b8fd5301f591d906155e`
  - Block: 33181489
  - Gas Used: 4,142,151
  - Gas Price: 0.001000108 gwei
  - Cost: 0.000004142598352308 ETH

**Total Deployment Cost**: 0.00000483055664378 ETH

### Verification

Both contracts were successfully verified on Sourcify:
- **BaseToken**: ✅ Verified (`exact_match`)
- **BaseSafeFactory**: ✅ Verified (`exact_match`)

### Block Explorer

- **BaseScan**: https://sepolia.basescan.org/

---

## Notes

- Both deployments used the same Treasury address: `0xa91D5A0a64ED5eeF11c4359C4631279695A338ef`
- All contracts were compiled with Solc 0.8.30
- EVM Version: Prague
- Base Sepolia deployments used optimization runs: 10000
- Deployment transactions are saved in the `broadcast/` directory
