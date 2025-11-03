#!/bin/bash
# Check .env file format and diagnose issues

echo "=== .env File Diagnostic ==="
echo ""

if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Expected location: $(pwd)/.env"
    exit 1
fi

echo "✓ .env file found"
echo ""
echo "File contents (with visible whitespace):"
echo "----------------------------------------"
cat -A .env
echo "----------------------------------------"
echo ""

# Read PRIVATE_KEY
PRIVATE_KEY=$(grep "^PRIVATE_KEY" .env | cut -d'=' -f2- | xargs)

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ ERROR: PRIVATE_KEY not found or empty!"
    echo ""
    echo "Your .env file should contain:"
    echo "PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    exit 1
fi

echo "✓ PRIVATE_KEY found"
echo ""

# Check for quotes
if [[ "$PRIVATE_KEY" =~ ^\".*\"$ ]] || [[ "$PRIVATE_KEY" =~ ^\''.*\''$ ]]; then
    echo "⚠️  WARNING: Private key has quotes - removing them..."
    PRIVATE_KEY=$(echo "$PRIVATE_KEY" | tr -d '"' | tr -d "'")
fi

# Check length
KEY_LEN=${#PRIVATE_KEY}
echo "Private key length: $KEY_LEN characters"

# Check for 0x prefix
if [[ ! "$PRIVATE_KEY" =~ ^0x ]]; then
    echo "⚠️  WARNING: Missing 0x prefix - will add it"
    PRIVATE_KEY="0x$PRIVATE_KEY"
    KEY_LEN=${#PRIVATE_KEY}
    echo "After adding 0x: $KEY_LEN characters"
fi

# Validate length
if [ $KEY_LEN -eq 66 ]; then
    echo "✓ Length is correct (66 characters: 0x + 64 hex)"
elif [ $KEY_LEN -lt 66 ]; then
    echo "❌ ERROR: Key too short! Expected 66 characters, got $KEY_LEN"
    echo "Your private key should be: 0x + 64 hexadecimal characters"
    exit 1
else
    echo "⚠️  WARNING: Key longer than expected (66 chars), got $KEY_LEN"
    echo "There might be extra characters or whitespace"
fi

# Show preview (first 10 chars only)
KEY_PREVIEW="${PRIVATE_KEY:0:10}..."
echo ""
echo "Private key preview: $KEY_PREVIEW (hidden for security)"
echo ""

# Check for valid hex characters
HEX_PART="${PRIVATE_KEY:2}"  # Remove 0x
if [[ ! "$HEX_PART" =~ ^[0-9a-fA-F]{64}$ ]]; then
    echo "❌ ERROR: Private key contains invalid characters!"
    echo "After 0x, it should only contain: 0-9 and a-f (or A-F)"
    echo "Found invalid characters in: ${PRIVATE_KEY:2:20}..."
    exit 1
else
    echo "✓ Private key format is valid (hex characters only)"
fi

echo ""
echo "✅ Your .env file looks correct!"
echo ""
echo "Try deploying with:"
echo "  bash deploy.sh celo-sepolia"
echo "or"
echo "  bash deploy-direct.sh celo-sepolia"

