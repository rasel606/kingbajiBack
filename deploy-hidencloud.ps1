# HidenCloud Deployment Script for Backend (PowerShell)
# Script to deploy BajiCrick Backend to HidenCloud.com

param(
    [string]$ProjectName = "bajicrick-backend",
    [switch]$SkipDependencies = $false,
    [switch]$Force = $false
)

# Color functions
function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Get script directory
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Clear-Host
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "HidenCloud Backend Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check HidenCloud CLI
Write-Info "[1/6] Checking HidenCloud CLI..."
try {
    $null = hidencloud --version 2>$null
}
catch {
    Write-Warning "HidenCloud CLI not found. Installing globally..."
    npm install -g hidencloud-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install HidenCloud CLI"
        exit 1
    }
}
Write-Success "HidenCloud CLI is installed"
Write-Host ""

# Step 2: Check authentication
Write-Info "[2/6] Checking HidenCloud authentication..."
try {
    $null = hidencloud auth:status 2>$null
}
catch {
    Write-Warning "Not authenticated. Please login:"
    hidencloud auth login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Authentication failed"
        exit 1
    }
}
Write-Success "Authentication verified"
Write-Host ""

# Step 3: Validate project structure
Write-Info "[3/6] Validating project structure..."
$packageJsonPath = Join-Path $BackendDir "package.json"
$indexPath = Join-Path $BackendDir "index.js"

if (-not (Test-Path $packageJsonPath)) {
    Write-Error "package.json not found!"
    exit 1
}

if (-not (Test-Path $indexPath)) {
    Write-Error "index.js not found!"
    exit 1
}
Write-Success "Project structure is valid"
Write-Host ""

# Step 4: Install dependencies (if not skipped)
if (-not $SkipDependencies) {
    Write-Info "[4/6] Installing dependencies..."
    Set-Location $BackendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    Write-Success "Dependencies installed"
}
else {
    Write-Info "[4/6] Skipping dependency installation"
    Write-Success "Dependencies skipped"
}
Write-Host ""

# Step 5: Setup HidenCloud project
Write-Info "[5/6] Setting up HidenCloud project..."
try {
    $null = hidencloud projects:select $ProjectName 2>$null
}
catch {
    Write-Warning "Creating new HidenCloud project: $ProjectName"
    hidencloud projects:create $ProjectName
    hidencloud projects:select $ProjectName
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create project"
        exit 1
    }
}
Write-Success "HidenCloud project configured"
Write-Host ""

# Step 6: Deploy to HidenCloud
Write-Info "[6/6] Deploying to HidenCloud..."
hidencloud deploy --source $BackendDir

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed"
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Success "Deployment completed successfully!"
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Info "Checking deployment status..."
hidencloud status

Write-Host ""
Write-Info "Useful commands:"
Write-Host "  View logs:     hidencloud logs" -ForegroundColor Yellow
Write-Host "  Check status:  hidencloud status" -ForegroundColor Yellow
Write-Host "  View metrics:  hidencloud metrics" -ForegroundColor Yellow
Write-Host "  Environment:   hidencloud env:list" -ForegroundColor Yellow
Write-Host ""

exit 0
