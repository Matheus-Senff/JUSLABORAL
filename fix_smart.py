#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import shutil

file_path = r"src\components\ProcessDetailView.tsx"
backup_path = file_path + ".backup"

# Backup
shutil.copy(file_path, backup_path)

# Ler arquivo
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar a linha que começa com '    'PREVIDENCIÁRIA':'
found_idx = -1
for i, line in enumerate(lines):
    if line.strip().startswith("'PREVIDENCIÁRIA':"):
        found_idx = i
        print(f"✓ Encontrada PREVIDENCIÁRIA na linha {i+1}")
        break

if found_idx == -1:
    print("✗ Não foi possível encontrar 'PREVIDENCIÁRIA'")
    exit(1)

# Fazer a substituição
lines[found_idx] = "    'PREVIDENCIÁRIA': ['AUXÍLIO-ACIDENTE', 'AUXÍLIO-DOENÇA', 'AUXÍLIO-REC-PROFISSIONAL', 'AUXÍLIO-TRAB-ACIDENTE', 'APOSENTADORIA-RÁPIDA-FAMÍLIA', 'BENEFÍCIO-ASSISTENCIAL-IDOSO', 'BENEFÍCIO-ASSISTENCIAL-PESSOA-DEFICIENTE', 'BENEFÍCIO-PRESTADOR-INFORMAÇÃO', 'BENEFÍCIO-REQUERENTE-INFORMAÇÃO', 'BENEFÍCIO-SOLICITAÇÃO-CÓPIA-DOCUMENTO', 'BENEFÍCIO-VALIDADE-DOCUMENTO', 'BUSCA-ATIVO-INFORMAÇÃO', 'CERTIDÃO-AUXÍLIO-ACIDENTE', 'CERTIDÃO-AUXÍLIO-DOENÇA', 'CERTIDÃO-AUXÍLIO-REC-PROFISSIONAL']\n"

# Salvar
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✓ Arquivo atualizado!")
print("  ✓ AUXÍLIO-DOEÇA → AUXÍLIO-DOENÇA")
print("  ✓ AUXÍLIO-TRAb → AUXÍLIO-TRAB")
print("  ✓ BENÉFİCIO → BENEFÍCIO (5 itens)")
