#!/bin/bash
# Bash script to load .env and deploy to Celo
# Usage: ./deploy.sh [celo-sepolia|celo]

NETWORK=${1:-celo-sepolia}

echo "Loading .env file..."

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Loaded environment variables"
else
    echo "Error: .env file not found!"
    exit 1
fi

# Trim whitespace from PRIVATE_KEY
PRIVATE_KEY=$(echo "$PRIVATE_KEY" | xargs)

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY not found in .env file!"
    exit 1
fi

# Validate private key format (should be 66 chars with 0x prefix or 64 without)
if [ ${#PRIVATE_KEY} -lt 64 ]; then
    echo "Error: PRIVATE_KEY appears to be too short!"
    exit 1
fi

# Add 0x prefix if missing
if [[ ! "$PRIVATE_KEY" =~ ^0x ]]; then
    PRIVATE_KEY="0x$PRIVATE_KEY"
    echo "Added 0x prefix to private key"
fi

# Debug info (don't print full key for security)
KEY_LENGTH=${#PRIVATE_KEY}
KEY_PREFIX="${PRIVATE_KEY:0:6}..."
echo "Private key length: $KEY_LENGTH characters"
echo "Private key starts with: $KEY_PREFIX"
echo ""

if [ $KEY_LENGTH -ne 66 ]; then
    echo "WARNING: Private key should be 66 characters (0x + 64 hex chars)"
    echo "Current length: $KEY_LENGTH"
fi

echo ""
echo "Deploying to $NETWORK..."
echo "Using Treasury: 0xa91d5a0a64ed5eef11c4359c4631279695a338ef"
echo ""

# Deploy using forge script
forge script script/DeployAll.s.sol:DeployAll \
    --rpc-url $NETWORK \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify

if [ $? -eq 0 ]; then
    echo ""
    echo "Deployment completed successfully!"
else
    echo ""
    echo "Deployment failed!"
    exit 1
fi

