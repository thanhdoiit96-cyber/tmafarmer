Add-Type -AssemblyName System.Drawing

function Open-Bitmap($name) {
  return [System.Drawing.Bitmap]::FromFile((Join-Path $PSScriptRoot "..\docs\assets\$name"))
}
function Draw-Cell($graphics, $image, $column, $row, $columns, $rows, $targetX, $targetY, $targetWidth, $targetHeight) {
  $left = [Math]::Floor($column * $image.Width / $columns)
  $top = [Math]::Floor($row * $image.Height / $rows)
  $right = [Math]::Floor(($column + 1) * $image.Width / $columns)
  $bottom = [Math]::Floor(($row + 1) * $image.Height / $rows)
  $sourceRect = New-Object System.Drawing.Rectangle $left, $top, ($right - $left), ($bottom - $top)
  $targetRect = New-Object System.Drawing.Rectangle $targetX, $targetY, $targetWidth, $targetHeight
  $graphics.DrawImage($image, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
}

$house = Open-Bitmap 'farmhouse-v2-source.png'
$crops = Open-Bitmap 'crops-v2-source.png'
$chicken = Open-Bitmap 'chicken-v2-source.png'
$atlas = New-Object System.Drawing.Bitmap 384, 128, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($atlas)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$graphics.DrawImage($house, (New-Object System.Drawing.Rectangle 0, 0, 96, 80), 0, 0, $house.Width, $house.Height, [System.Drawing.GraphicsUnit]::Pixel)
for ($row = 0; $row -lt 3; $row++) {
  for ($column = 0; $column -lt 4; $column++) {
    Draw-Cell $graphics $crops $column $row 4 3 (96 + $column * 24) ($row * 24) 24 24
    $frame = $row * 4 + $column
    $targetX = if ($frame -lt 8) { 192 + $frame * 24 } else { 192 + ($frame - 8) * 24 }
    $targetY = if ($frame -lt 8) { 0 } else { 24 }
    Draw-Cell $graphics $chicken $column $row 4 3 $targetX $targetY 24 24
  }
}

$graphics.Dispose()
$house.Dispose(); $crops.Dispose(); $chicken.Dispose()
$outputPath = Join-Path $PSScriptRoot '..\public\pixel\vertical-slice-v2.png'
$atlas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$atlas.Dispose()
Write-Output 'Generated public/pixel/vertical-slice-v2.png (384x128, RGBA)'
