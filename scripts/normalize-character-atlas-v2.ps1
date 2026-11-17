Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot '..\docs\assets\character-atlas-v2-source.png'
$outputPath = Join-Path $PSScriptRoot '..\public\pixel\characters-v2.png'
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
$atlas = New-Object System.Drawing.Bitmap 384, 128, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($atlas)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

for ($row = 0; $row -lt 4; $row++) {
  $top = [Math]::Floor($row * $source.Height / 4)
  $bottom = [Math]::Floor(($row + 1) * $source.Height / 4)
  for ($column = 0; $column -lt 16; $column++) {
    $left = [Math]::Floor($column * $source.Width / 16)
    $right = [Math]::Floor(($column + 1) * $source.Width / 16)
    $sourceRect = New-Object System.Drawing.Rectangle $left, $top, ($right - $left), ($bottom - $top)
    $targetRect = New-Object System.Drawing.Rectangle ($column * 24), ($row * 32), 24, 32
    $graphics.DrawImage($source, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
  }
}

$graphics.Dispose()
$source.Dispose()
$atlas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$atlas.Dispose()
Write-Output "Generated public/pixel/characters-v2.png (384x128, RGBA)"
