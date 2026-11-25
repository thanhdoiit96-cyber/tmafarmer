param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$workspaceRoot = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$buildTarget = [System.IO.Path]::GetFullPath((Join-Path $workspaceRoot 'dist'))
if ((Split-Path -Parent $buildTarget) -ne $workspaceRoot -or (Split-Path -Leaf $buildTarget) -ne 'dist') {
  throw 'Refusing cleanup outside the workspace dist directory.'
}
if (-not (Test-Path -LiteralPath $buildTarget)) { Write-Output 'dist is already absent.'; exit 0 }
$targetInfo = Get-Item -LiteralPath $buildTarget -Force
if ($targetInfo.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
  throw 'Refusing cleanup of a linked dist directory.'
}
if (-not $Apply) { Write-Output "Dry run: would remove $buildTarget. Add -Apply to proceed."; exit 0 }
Remove-Item -LiteralPath $buildTarget -Recurse -Force
Write-Output 'Removed dist. Recreate it with npm run build before deploying the build output.'
