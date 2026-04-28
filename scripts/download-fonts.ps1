# ============================================================
# PatunganNyok — Download Google Fonts for Offline Use
# Run this script ONCE from the project root:
#   powershell -ExecutionPolicy Bypass -File scripts/download-fonts.ps1
# ============================================================

$fontsDir = "src\assets\fonts"
New-Item -ItemType Directory -Force -Path $fontsDir | Out-Null

Write-Host "Downloading fonts to $fontsDir ..." -ForegroundColor Cyan

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Referer"    = "https://fonts.googleapis.com/"
}

$fonts = @(
    # Inter — Latin subset
    @{ url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"; name = "inter-300.woff2" },
    @{ url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"; name = "inter-400.woff2" },
    @{ url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"; name = "inter-500.woff2" },
    @{ url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"; name = "inter-600.woff2" },
    # Poppins — Latin subset
    @{ url = "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2"; name = "poppins-400.woff2" },
    @{ url = "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1JlFc-K.woff2"; name = "poppins-500.woff2" },
    @{ url = "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1JlFc-K.woff2"; name = "poppins-600.woff2" },
    @{ url = "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1JlFc-K.woff2"; name = "poppins-700.woff2" },
    @{ url = "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1JlFc-K.woff2"; name = "poppins-800.woff2" }
)

foreach ($font in $fonts) {
    $outPath = Join-Path $fontsDir $font.name
    try {
        Invoke-WebRequest -Uri $font.url -OutFile $outPath -Headers $headers -TimeoutSec 30
        $size = (Get-Item $outPath).Length
        Write-Host "  [OK] $($font.name) ($size bytes)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] $($font.name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! Font files saved to: $fontsDir" -ForegroundColor Cyan
Write-Host "Now run: npx ionic build --prod && npx cap sync android" -ForegroundColor Yellow
