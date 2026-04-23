# Script de deploy para JUSLABORAL
Set-Location "c:\Users\Usuário\Desktop\PASTA VISUAL STUDIO"

Write-Host "=== Build ===" -ForegroundColor Cyan
npm run build

Write-Host "`n=== Git Add ===" -ForegroundColor Cyan
git add -A

Write-Host "`n=== Git Commit ===" -ForegroundColor Cyan
git commit -m "feat: remove coluna Ações da tabela, parceiro dropdown no detalhe"

Write-Host "`n=== Git Push ===" -ForegroundColor Cyan
git push origin main

Write-Host "`n=== Concluído ===" -ForegroundColor Green
