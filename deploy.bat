@echo off
cd /d "c:\Users\Usuário\Desktop\PASTA VISUAL STUDIO"

echo === Build ===
call npm run build

echo.
echo === Git Add ===
git add -A

echo.
echo === Git Commit ===
git commit -m "feat: remove coluna Ações da tabela, parceiro dropdown no detalhe"

echo.
echo === Git Push ===
git push origin main

echo.
echo === Git Log ===
git log --oneline -1

echo.
echo Concluído!
pause
