# Deployment Instructions for BaseSafeFactory

## Prerequisites

1. **Install Foundry** (if not already installed):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Set up environment variables**:
   - `TOKEN_ADDRESS`: The ERC20 token address to use with the factory
   - `TREASURY_ADDRESS`: The treasury address where fees will be sent
   - `PRIVATE_KEY`: Your private key for deployment (optional, can use --private-key flag)
   - `RPC_URL`: The RPC URL for your target network

## Deployment Options

### Option 1: Using Environment Variables

Set the required addresses as environment variables:

**Windows (PowerShell)**:
```powershell
$env:TOKEN_ADDRESS="0x..."
$env:TREASURY_ADDRESS="0x..."
$env:PRIVATE_KEY="your-private-key"
$env:RPC_URL="https://your-rpc-url"
```

**Linux/Mac**:
```bash
export TOKEN_ADDRESS=0x...
export TREASURY_ADDRESS=0x...
export PRIVATE_KEY=your-private-key
export RPC_URL=https://your-rpc-url
```

Then deploy:
```bash
forge script script/DeployBaseSafeFactory.s.sol:DeployBaseSafeFactory \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify
```

### Option 2: Using Forge Script with Inline Variables

```bash
forge script script/DeployBaseSafeFactory.s.sol:DeployBaseSafeFactory \
    --rpc-url https://your-rpc-url \
    --private-key your-private-key \
    --sig "run()" \
    --broadcast \
    --verify \
    --via-ir
```

Note: You'll need to modify the script to accept constructor arguments if you want to pass them directly.

### Option 3: Deploy to Local Network (Anvil)

1. Start Anvil:
   ```bash
   anvil
   ```

2. Deploy using the private key from Anvil:
   ```bash
   forge script script/DeployBaseSafeFactory.s.sol:DeployBaseSafeFactory \
       --rpc-url http://localhost:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
   ```

## Verification

After deployment, the script will output:
- The deployed contract address
- The token address used
- The treasury address used

## Common Networks

- **Sepolia Testnet**: `--rpc-url https://sepolia.infura.io/v3/YOUR_API_KEY`
- **Mainnet**: `--rpc-url https://mainnet.infura.io/v3/YOUR_API_KEY`
- **Local Anvil**: `--rpc-url http://localhost:8545`

## Important Notes

1. **Security**: Never commit your private key to version control
2. **Network**: Ensure the TOKEN_ADDRESS exists on your target network
3. **Verification**: Add `--verify` flag if you want to verify on block explorer
4. **Gas**: Ensure your deployer wallet has sufficient ETH for gas fees

