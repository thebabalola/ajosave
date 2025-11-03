#!/bin/bash
# Direct deployment - helps diagnose .env issues
# Usage: ./deploy-direct.sh [celo-sepolia|celo]

NETWORK=${1:-celo-sepolia}

echo "=== Direct Deployment Script ==="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found in current directory!"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "Reading .env file..."
# Read PRIVATE_KEY line by line to handle issues
PRIVATE_KEY=""
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [ "$key" == "PRIVATE_KEY" ]; then
        PRIVATE_KEY="$value"
        echo "Found PRIVATE_KEY"
        break
    fi
done < .env

# If still empty, try simple export
if [ -z "$PRIVATE_KEY" ]; then
    echo "Trying alternative method to load .env..."
    set -a
    source .env
    set +a
    PRIVATE_KEY="$PRIVATE_KEY"
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo ""
    echo "ERROR: Could not find PRIVATE_KEY in .env file!"
    echo ""
    echo "Please check your .env file contains:"
    echo "PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    echo ""
    exit 1
fi

# Clean up the private key
PRIVATE_KEY=$(echo "$PRIVATE_KEY" | tr -d '"' | tr -d "'" | xargs)

# Add 0x if missing
if [[ ! "$PRIVATE_KEY" =~ ^0x ]]; then
    PRIVATE_KEY="0x$PRIVATE_KEY"
fi

# Show diagnostic info (first 8 chars only for security)
KEY_LEN=${#PRIVATE_KEY}
KEY_PREVIEW="${PRIVATE_KEY:0:8}..."
echo "Private key length: $KEY_LEN"
echo "Private key preview: $KEY_PREVIEW"
echo ""

if [ $KEY_LEN -ne 66 ]; then
    echo "WARNING: Expected 66 characters (0x + 64 hex), got $KEY_LEN"
    echo "This might cause issues!"
    echo ""
fi

echo "Deploying to $NETWORK..."
echo "Treasury: 0xa91D5A0a64ED5eeF11c4359C4631279695A338ef"
echo ""

# Deploy
forge script script/DeployAll.s.sol:DeployAll \
    --rpc-url "$NETWORK" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Check your .env file format: PRIVATE_KEY=0x... (no quotes, no spaces)"
    echo "2. Ensure private key is exactly 64 hex characters after 0x (66 total)"
    echo "3. Verify you have CELO tokens in your wallet for gas fees"
    echo "4. Check your wallet address matches the private key"
    exit 1
fi

