# Project Activity: Smart Contract Deployment on Celo Network

## Activity Name
**Deployed BaseSafeFactory Smart Contracts on Celo Sepolia Testnet**

## Description
Successfully deployed and verified the BaseSafeFactory smart contract system on the Celo Sepolia testnet. This milestone enables multi-chain support for the project, allowing users to create and manage safe groups (AJO - Ajo groups) on the Celo network. The deployment includes:

- **BaseToken (BST)**: An ERC20 token contract deployed to serve as the base currency for group operations
- **BaseSafeFactory**: The main factory contract that enables creation of flexible, rotational, and target-based savings groups
- **Contract Verification**: All contracts were successfully verified on Sourcify for transparency and auditability

The deployment process involved setting up deployment scripts, configuring network-specific parameters, managing gas optimization, and ensuring proper contract verification. This expands the project's reach to the Celo ecosystem, which is particularly valuable for users in regions where Celo's mobile-first approach and low transaction costs are beneficial.

## Activity Dates
- **Start Date**: [Enter your deployment start date]
- **End Date**: [Enter your deployment completion date]

## Outputs

### Deliverables

| Name | Proof/Link | Description/Comment |
|------|------------|---------------------|
| BaseToken Contract (BST) | https://sepolia.celoscan.io/address/0x24642ffABF43D4bd33e1E883A23E10DdFde186c6 | ERC20 token contract deployed on Celo Sepolia testnet. Contract address: `0x24642ffABF43D4bd33e1E883A23E10DdFde186c6`. Token Name: Base Safe Token (BST). Successfully verified on Sourcify. Transaction hash: `0x4b7267a5e9df420d78c1f30f3f33ff7fbf2aa23179e4421d63a91cdb96df06ae`. Block: 8846676. |
| BaseSafeFactory Contract | https://sepolia.celoscan.io/address/0xa71C861930C0973AE57c577aC19EB7f11e7d74a6 | Main factory contract enabling creation of flexible, rotational, and target-based savings groups on Celo Sepolia testnet. Contract address: `0xa71C861930C0973AE57c577aC19EB7f11e7d74a6`. Successfully verified on Sourcify with exact_match status. Transaction hash: `0x60b5a40b6f77d3662f2645aa54e082afc38506a7002da2e412a9d23c499913b1`. Block: 8846677. |
| Deployment Documentation | https://github.com/[your-repo]/blob/[branch]/smartcontract/DEPLOYMENTS.md | Comprehensive deployment summary documenting contract addresses, transaction details, verification status, and network configurations for both Celo Sepolia and Base Sepolia deployments. |

## Metrics

### Technical Metrics
- **Contracts Deployed**: 2
- **Verification Success Rate**: 100% (2/2 contracts verified)
- **Deployment Gas Efficiency**: 
  - BaseToken: 1,117,391 gas units
  - BaseSafeFactory: 6,965,015 gas units
  - Total: 8,082,406 gas units
- **Network Support**: Expanded to Celo ecosystem (Chain ID: 11142220)
- **Contract Size Optimization**: Successfully deployed despite size constraints (via --via-ir optimization)

### Deployment Metrics
- **Total Deployment Cost**: 0.202060150008082406 CELO
- **Block Confirmation Time**: ~2 blocks
- **Verification Status**: Both contracts verified with `exact_match` status on Sourcify

### Project Impact Metrics
- **Network Coverage**: Project now supports 2 testnets (Celo Sepolia + Base Sepolia)
- **Accessibility**: Enabled deployment on Celo's low-cost, mobile-friendly network
- **Code Quality**: All contracts compiled with Solidity 0.8.30 and Prague EVM version

## Grant Association
[Select the relevant grant that helped accomplish this activity]

## Notes
- Treasury address configured: `0xa91D5A0a64ED5eeF11c4359C4631279695A338ef`
- All contracts use industry-standard OpenZeppelin libraries for security
- Deployment scripts are reusable for future network expansions
- Contracts are ready for mainnet deployment after additional testing

