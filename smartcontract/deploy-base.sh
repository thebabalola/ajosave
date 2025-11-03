#!/bin/bash
# Deploy to Base Sepolia or Base Mainnet
# Usage: ./deploy-base.sh [base-sepolia|base]

NETWORK=${1:-base-sepolia}

echo "=== Base Network Deployment ==="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found in current directory!"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "Loading .env file..."

# Load .env file
if [ -f .env ]; then
    # Try to load with source first
    set -a
    source .env 2>/dev/null
    set +a
    
    # If PRIVATE_KEY still empty, try alternative method
    if [ -z "$PRIVATE_KEY" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    echo "✓ Loaded environment variables"
else
    echo "Error: .env file not found!"
    exit 1
fi

# Trim whitespace from PRIVATE_KEY
PRIVATE_KEY=$(echo "$PRIVATE_KEY" | tr -d '"' | tr -d "'" | xargs)

# Validate PRIVATE_KEY
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY not found in .env file!"
    echo ""
    echo "Your .env file should contain:"
    echo "PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    exit 1
fi

# Add 0x prefix if missing
if [[ ! "$PRIVATE_KEY" =~ ^0x ]]; then
    PRIVATE_KEY="0x$PRIVATE_KEY"
fi

# Validate length
KEY_LEN=${#PRIVATE_KEY}
if [ $KEY_LEN -ne 66 ]; then
    echo "WARNING: Private key should be 66 characters (0x + 64 hex)"
    echo "Current length: $KEY_LEN"
fi

echo ""
echo "Network: $NETWORK"
echo "Treasury: 0xa91D5A0a64ED5eeF11c4359C4631279695A338ef"
echo ""

# Deploy using forge script
echo "Deploying contracts..."
echo ""

forge script script/DeployAll.s.sol:DeployAll \
    --rpc-url "$NETWORK" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --via-ir

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "View your contracts on BaseScan:"
    if [ "$NETWORK" == "base-sepolia" ]; then
        echo "https://sepolia.basescan.org/"
    else
        echo "https://basescan.org/"
    fi
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure your wallet has ETH (for Base Sepolia, get testnet ETH from a faucet)"
    echo "2. Check your .env file format: PRIVATE_KEY=0x... (no quotes, no spaces)"
    echo "3. Verify you're connected to the network"
    exit 1
fi

