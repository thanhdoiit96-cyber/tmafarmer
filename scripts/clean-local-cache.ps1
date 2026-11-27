param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$localRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot '.local'))
if (-not (Test-Path -LiteralPath $localRoot)) { Write-Output 'No local cache directory.'; exit 0 }
if ((Get-Item -LiteralPath $localRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing a linked .local directory.' }
# Only retired profiles from this review; do not include current/future profiles automatically.
$profileNames = @('edge-recovery-qa','edge-taskbook-qa','edge-taskbook-v3-qa')
$profileTargets = @($profileNames | ForEach-Object { Join-Path $localRoot $_ } | Where-Object { Test-Path -LiteralPath $_ })
# Retain reusable qa-* checks, database files, backups and images. Archive one-off editors/wrappers.
$helperTargets = @(Get-ChildItem -LiteralPath $localRoot -File | Where-Object {
  $_.Extension -in @('.mjs','.js','.py') -and $_.Name -match '^(capture-|create-|extend-|fix-|inspect-|prepare-|refine-|update-|run-|clean-hud-hire-css\.)'
})
$targets = @($profileTargets) + @($helperTargets | ForEach-Object { $_.FullName })
foreach ($candidate in $targets) {
  $resolvedTarget = [IO.Path]::GetFullPath($candidate)
  if ((Split-Path -Parent $resolvedTarget) -ne $localRoot) { throw 'Target is not directly inside .local.' }
  if ((Get-Item -LiteralPath $resolvedTarget -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing a linked cleanup target.' }
  if (Test-Path -LiteralPath $resolvedTarget -PathType Container) {
    if (Get-ChildItem -LiteralPath $resolvedTarget -Recurse -Force -Attributes ReparsePoint) { throw 'Refusing a profile containing links.' }
  }
}
$profileBytes = 0
foreach ($profileTarget in $profileTargets) { $profileBytes += (Get-ChildItem -LiteralPath $profileTarget -File -Force -Recurse | Measure-Object Length -Sum).Sum }
Write-Output ('Retired browser profiles: ' + $profileTargets.Count + ', ' + [math]::Round($profileBytes / 1MB,2) + ' MiB')
Write-Output ('One-off helper scripts to archive: ' + $helperTargets.Count)
if (-not $Apply) { Write-Output 'Dry run. Use -Apply to archive helpers/profile storage and remove only these targets.'; exit 0 }
if (-not $targets.Count) { Write-Output 'Nothing to clean.'; exit 0 }
if ($profileTargets.Count) {
  $edgeProcesses = @(Get-CimInstance Win32_Process -Filter "Name='msedge.exe'")
  foreach ($profileName in $profileNames) {
    if ($edgeProcesses | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($profileName) }) { throw ('Browser profile is still running: ' + $profileName) }
  }
}
$backupRoot = Join-Path $localRoot 'cleanup-backups'
if ((Test-Path -LiteralPath $backupRoot) -and ((Get-Item -LiteralPath $backupRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Refusing linked backup directory.' }
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$manifest = @()
if ($helperTargets.Count) {
  $helperArchive = Join-Path $backupRoot ($stamp + '-one-off-helpers.zip')
  Compress-Archive -LiteralPath $helperTargets.FullName -DestinationPath $helperArchive
  foreach ($helper in $helperTargets) {
    $manifest += [PSCustomObject]@{ kind='helper'; path=('.local/' + $helper.Name); bytes=$helper.Length; sha256=(Get-FileHash -LiteralPath $helper.FullName -Algorithm SHA256).Hash; archive=(Split-Path -Leaf $helperArchive) }
  }
  # Read the archive before deleting originals, and verify every expected entry is present.
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archiveCheck = [IO.Compression.ZipFile]::OpenRead($helperArchive)
  try {
    foreach ($helper in $helperTargets) { if (-not ($archiveCheck.Entries | Where-Object { $_.Name -eq $helper.Name -and $_.Length -eq $helper.Length })) { throw ('Archive entry missing: ' + $helper.Name) } }
  } finally { $archiveCheck.Dispose() }
}
foreach ($profileTarget in $profileTargets) {
  $profileName = Split-Path -Leaf $profileTarget
  $stateTargets = @('Default\Local Storage','Default\IndexedDB','Default\Session Storage') | ForEach-Object { Join-Path $profileTarget $_ } | Where-Object { Test-Path -LiteralPath $_ }
  $stateArchive = $null
  if ($stateTargets.Count) {
    $stateArchive = Join-Path $backupRoot ($stamp + '-' + $profileName + '-state.zip')
    Compress-Archive -LiteralPath $stateTargets -DestinationPath $stateArchive
    if (-not (Test-Path -LiteralPath $stateArchive)) { throw 'Profile state archive missing.' }
  }
  $manifest += [PSCustomObject]@{ kind='retired-browser-profile'; path=('.local/' + $profileName); archive=$(if($stateArchive){Split-Path -Leaf $stateArchive}else{$null}); note='Only local/IndexedDB/session storage retained; browser binaries, cache, cookies and history are disposable QA data.' }
}
$manifestPath = Join-Path $backupRoot ($stamp + '-local-cleanup-manifest.json')
ConvertTo-Json -InputObject @($manifest) -Depth 4 | Set-Content -LiteralPath $manifestPath -Encoding utf8
foreach ($helper in $helperTargets) { Remove-Item -LiteralPath $helper.FullName -Force }
foreach ($profileTarget in $profileTargets) { Remove-Item -LiteralPath $profileTarget -Recurse -Force }
Write-Output ('Cleanup complete. Recovery manifest: ' + $manifestPath)
Write-Output 'Database, reusable QA checks, documents, artwork, existing backups and Git history were retained.'
