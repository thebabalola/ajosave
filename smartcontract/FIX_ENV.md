# Fixing .env File for Private Key

The error "Failed to decode private key" means your `.env` file format is incorrect.

## Correct Format

Your `.env` file should look like this (one line, no spaces around =):

```
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Common Mistakes:

### ❌ Wrong - Has quotes:
```
PRIVATE_KEY="0x1234567890abcdef..."
```

### ❌ Wrong - Has spaces:
```
PRIVATE_KEY = 0x1234567890abcdef...
```

### ❌ Wrong - No 0x prefix:
```
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### ❌ Wrong - Has extra newlines or spaces:
```
PRIVATE_KEY=0x1234567890abcdef
1234567890abcdef...
```

### ✅ Correct - No quotes, no spaces, has 0x:
```
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Steps to Fix:

1. Open your `.env` file in the `smartcontract` directory
2. Make sure it's formatted exactly as:
   ```
   PRIVATE_KEY=0xYOUR_64_CHARACTER_HEX_PRIVATE_KEY
   ```
3. No quotes, no spaces around the `=`
4. Must start with `0x`
5. Must be exactly 66 characters total (0x + 64 hex characters)

## Verify:

After fixing, test the format:
```bash
cd smartcontract
bash deploy.sh celo-sepolia
```

