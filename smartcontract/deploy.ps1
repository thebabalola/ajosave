# PowerShell script to load .env and deploy to Celo
# Usage: .\deploy.ps1 [celo-sepolia|celo]

param(
    [Parameter(Position=0)]
    [ValidateSet("celo-sepolia", "celo")]
    [string]$Network = "celo-sepolia"
)

Write-Host "Loading .env file..." -ForegroundColor Cyan

# Load .env file
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
            Write-Host "Loaded: $name" -ForegroundColor Green
        }
    }
} else {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

if (-not $env:PRIVATE_KEY) {
    Write-Host "Error: PRIVATE_KEY not found in .env file!" -ForegroundColor Red
    exit 1
}

Write-Host "`nDeploying to $Network..." -ForegroundColor Cyan
Write-Host "Using Treasury: 0xa91d5a0a64ed5eef11c4359c4631279695a338ef" -ForegroundColor Yellow
Write-Host ""

# Deploy using forge script
forge script script/DeployAll.s.sol:DeployAll `
    --rpc-url $Network `
    --private-key $env:PRIVATE_KEY `
    --broadcast `
    --verify

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
}

