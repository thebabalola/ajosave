# Deploy to Celo Network

This guide shows how to deploy the BaseToken and BaseSafeFactory contracts to Celo network.

## Prerequisites

1. **Install Foundry** (if not already installed):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Get CELO tokens** for gas fees:
   - Celo Sepolia Testnet: Get testnet tokens from [Celo Faucet](https://faucet.celo.org/)
   - Celo Mainnet: You need CELO tokens in your wallet

3. **Private Key**: Your wallet private key for deployment

## Configuration

The `foundry.toml` file is already configured with Celo RPC endpoints:
- `celo-sepolia`: Celo Sepolia Testnet
- `celo`: Celo Mainnet

### .env File Setup

Create a `.env` file in the `smartcontract` directory with your private key:

```bash
PRIVATE_KEY=your_private_key_here
```

**⚠️ Important**: The `.env` file is already in `.gitignore` - never commit it!

Foundry will automatically load environment variables from the `.env` file.

## Deployment

### 🚀 Easiest Method: Using Helper Scripts

Make sure your `.env` file has `PRIVATE_KEY` defined, then:

**Windows PowerShell:**
```powershell
cd smartcontract
.\deploy.ps1 celo-sepolia    # For testnet
# or
.\deploy.ps1 celo             # For mainnet
```

**Linux/Mac:**
```bash
cd smartcontract
chmod +x deploy.sh
./deploy.sh celo-sepolia      # For testnet
# or
./deploy.sh celo               # For mainnet
```

### Option 1: Deploy to Celo Sepolia Testnet (Manual Method)

**Windows PowerShell:**
```powershell
cd smartcontract

# Load .env file
Get-Content .env | ForEach-Object {
    $name, $value = $_ -split '=', 2
    Set-Item -Path "env:$name" -Value $value
}

# Deploy
forge script script/DeployAll.s.sol:DeployAll --rpc-url celo-sepolia --private-key $env:PRIVATE_KEY --broadcast --verify
```

**Linux/Mac:**
```bash
cd smartcontract

# Load .env file
export $(cat .env | grep -v '^#' | xargs)

# Deploy
forge script script/DeployAll.s.sol:DeployAll --rpc-url celo-sepolia --private-key $PRIVATE_KEY --broadcast --verify
```

### Option 2: Deploy to Celo Mainnet

Use the helper script (recommended):
```powershell
# Windows PowerShell:
.\deploy.ps1 celo

# Linux/Mac:
./deploy.sh celo
```

**Or manually:**
```powershell
# Windows PowerShell:
Get-Content .env | ForEach-Object {
    $name, $value = $_ -split '=', 2
    Set-Item -Path "env:$name" -Value $value
}
forge script script/DeployAll.s.sol:DeployAll --rpc-url celo --private-key $env:PRIVATE_KEY --broadcast --verify
```

```bash
# Linux/Mac:
export $(cat .env | grep -v '^#' | xargs)
forge script script/DeployAll.s.sol:DeployAll --rpc-url celo --private-key $PRIVATE_KEY --broadcast --verify
```

## What Gets Deployed

1. **BaseToken** (ERC20)
   - Name: "Base Safe Token"
   - Symbol: "BST"
   - Owner can mint tokens

2. **BaseSafeFactory**
   - Uses the deployed BaseToken
   - Treasury Address: `0xa91d5a0a64ed5eef11c4359c4631279695a338ef`

## Deployment Output

After successful deployment, you'll see:
```
=== Deployment Summary ===
Token Address: 0x...
Factory Address: 0x...
Treasury Address: 0xa91d5a0a64ed5eef11c4359c4631279695a338ef
Token Name: Base Safe Token
Token Symbol: BST
```

## Verify on Celo Explorer

After deployment with `--verify` flag, you can view your contracts on:
- **Celo Sepolia**: https://sepolia.celoscan.io/
- **Celo Mainnet**: https://celoscan.io/

## Alternative: Using `forge create` (Manual Deployment)

If you prefer to deploy contracts separately:

### Deploy BaseToken first:
```bash
forge create --rpc-url celo-sepolia --private-key <your_private_key> src/BaseToken.sol:BaseToken --constructor-args "Base Safe Token" "BST"
```

### Then deploy BaseSafeFactory:
```bash
forge create --rpc-url celo-sepolia --private-key <your_private_key> src/BaseSafeFactory.sol:BaseSafeFactory --constructor-args <TOKEN_ADDRESS> 0xa91d5a0a64ed5eef11c4359c4631279695a338ef
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit your private key to version control
- Use environment variables or a secure key management system
- Test on testnet before deploying to mainnet
- Ensure your wallet has sufficient CELO for gas fees

## Troubleshooting

1. **"insufficient funds for gas"**: Make sure your wallet has CELO tokens
2. **"execution reverted"**: Check that all constructor parameters are valid
3. **Verification fails**: Ensure etherscan API keys are configured in `foundry.toml` if using `--verify`

