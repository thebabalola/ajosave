# Deploy to Base Network

This guide shows how to deploy the BaseToken and BaseSafeFactory contracts to Base network.

## Prerequisites

1. **Install Foundry** (if not already installed):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Get Base Sepolia ETH** for gas fees:
   - Base Sepolia Faucet: Get testnet ETH from [Base Faucets](https://docs.base.org/tools/network-faucets)
   - Base Mainnet: You need ETH in your wallet

3. **Private Key**: Your wallet private key for deployment (stored in `.env` file)

## Configuration

The `foundry.toml` file is already configured with Base RPC endpoints:
- `base-sepolia`: Base Sepolia Testnet
- `base`: Base Mainnet

### .env File Setup

Create a `.env` file in the `smartcontract` directory:

```bash
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

**⚠️ Important**: The `.env` file is already in `.gitignore` - never commit it!

### Secure Private Key (Alternative Method)

For better security, you can store your private key in Foundry's keystore:

```bash
cast wallet import deployer --interactive
```

Then use `--account deployer` instead of `--private-key` in deployment commands.

## Deployment

### Option 1: Deploy to Base Sepolia Testnet (Recommended for Testing)

Using the deployment script:

```bash
cd smartcontract
chmod +x deploy-base.sh
./deploy-base.sh base-sepolia
```

Or manually with forge:

```bash
cd smartcontract

# Load .env file
source .env

# Deploy
forge script script/DeployAll.s.sol:DeployAll \
    --rpc-url base-sepolia \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify
```

### Option 2: Deploy to Base Mainnet

```bash
cd smartcontract
./deploy-base.sh base
```

Or manually:

```bash
cd smartcontract
source .env

forge script script/DeployAll.s.sol:DeployAll \
    --rpc-url base \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify
```

### Option 3: Using Foundry Keystore (More Secure)

If you imported your key with `cast wallet import`:

```bash
forge script script/DeployAll.s.sol:DeployAll \
    --rpc-url base-sepolia \
    --account deployer \
    --broadcast \
    --verify
```

## What Gets Deployed

1. **BaseToken** (ERC20)
   - Name: "Base Safe Token"
   - Symbol: "BST"
   - Owner can mint tokens

2. **BaseSafeFactory**
   - Uses the deployed BaseToken
   - Treasury Address: `0xa91D5A0a64ED5eeF11c4359C4631279695A338ef`

## Deployment Output

After successful deployment, you'll see:

```
=== Deployment Summary ===
Token Address: 0x...
Factory Address: 0x...
Treasury Address: 0xa91D5A0a64ED5eeF11c4359C4631279695A338ef
Token Name: Base Safe Token
Token Symbol: BST
```

## Verify on BaseScan

After deployment, view your contracts on:
- **Base Sepolia**: https://sepolia.basescan.org/
- **Base Mainnet**: https://basescan.org/

## Interact with Deployed Contracts

### Check Token Balance

```bash
cast call <TOKEN_ADDRESS> "balanceOf(address)(uint256)" <YOUR_ADDRESS> --rpc-url base-sepolia
```

### Check Factory Owner

```bash
cast call <FACTORY_ADDRESS> "owner()(address)" --rpc-url base-sepolia
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit your private key to version control
- Use Foundry keystore for production deployments
- Test on testnet before deploying to mainnet
- Ensure your wallet has sufficient ETH for gas fees

## Troubleshooting

1. **"insufficient funds for gas"**: 
   - Base Sepolia: Get testnet ETH from [Base Faucets](https://docs.base.org/tools/network-faucets)
   - Base Mainnet: Ensure you have ETH in your wallet

2. **"Failed to decode private key"**: 
   - Check your `.env` file format: `PRIVATE_KEY=0x...` (no quotes, no spaces)
   - Ensure it's exactly 66 characters (0x + 64 hex chars)

3. **"execution reverted"**: 
   - Check that all constructor parameters are valid
   - Ensure your wallet has sufficient balance

4. **Verification fails**: 
   - Ensure BaseScan API keys are configured in `foundry.toml` if using `--verify`

