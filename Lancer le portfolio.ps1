$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$portfolioRuntime = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies'
$portfolioNodeFolder = Join-Path $portfolioRuntime 'node\bin'
$portfolioPnpmFolder = Join-Path $portfolioRuntime 'bin\fallback'
if (Test-Path -LiteralPath $portfolioNodeFolder) {
    $env:PATH = "$portfolioNodeFolder;$portfolioPnpmFolder;$env:PATH"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Installez Node.js pour lancer le portfolio sur cet ordinateur.'
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw 'Installez pnpm avec npm install -g pnpm, puis relancez ce fichier.'
}
if (-not (Test-Path -LiteralPath 'node_modules\astro\astro.js')) {
    Write-Host 'Premiere ouverture : installation des outils necessaires au site...'
    & pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw 'Installation interrompue. Verifiez votre connexion et relancez.' }
}
Write-Host 'Ouvrez http://127.0.0.1:4321 dans votre navigateur. Gardez cette fenetre ouverte.'
& pnpm dev
