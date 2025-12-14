# restart-app.ps1
# Recompiles and restarts the Flutter app on the emulator

param(
    [switch]$Clean,      # Run flutter clean first
    [switch]$Release,    # Build in release mode
    [string]$Device      # Specific device ID (optional)
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "🔄 Restarting Flutter app..." -ForegroundColor Cyan

# Optional clean
if ($Clean) {
    Write-Host "🧹 Running flutter clean..." -ForegroundColor Yellow
    flutter clean
    flutter pub get
}

# Build device argument
$deviceArg = if ($Device) { "-d $Device" } else { "" }

# Build mode argument
$modeArg = if ($Release) { "--release" } else { "" }

# Run the app
Write-Host "🚀 Launching app..." -ForegroundColor Green
$command = "flutter run $deviceArg $modeArg"
Write-Host "Running: $command" -ForegroundColor DarkGray
Invoke-Expression $command
