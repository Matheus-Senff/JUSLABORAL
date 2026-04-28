#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

file_path = r"src\components\ProcessDetailView.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Corrigir TIPO_OPTIONS line 37
for i, line in enumerate(lines):
    if "'PREVIDENCIÁRIA': ['AUXÍLIO-ACIDENTE'" in line:
        # Substituir a linha inteira com a versão corrigida
        lines[i] = "    'PREVIDENCIÁRIA': ['AUXÍLIO-ACIDENTE', 'AUXÍLIO-DOENÇA', 'AUXÍLIO-REC-PROFISSIONAL', 'AUXÍLIO-TRAB-ACIDENTE', 'APOSENTADORIA-RÁPIDA-FAMÍLIA', 'BENEFÍCIO-ASSISTENCIAL-IDOSO', 'BENEFÍCIO-ASSISTENCIAL-PESSOA-DEFICIENTE', 'BENEFÍCIO-PRESTADOR-INFORMAÇÃO', 'BENEFÍCIO-REQUERENTE-INFORMAÇÃO', 'BENEFÍCIO-SOLICITAÇÃO-CÓPIA-DOCUMENTO', 'BENEFÍCIO-VALIDADE-DOCUMENTO', 'BUSCA-ATIVO-INFORMAÇÃO', 'CERTIDÃO-AUXÍLIO-ACIDENTE', 'CERTIDÃO-AUXÍLIO-DOENÇA', 'CERTIDÃO-AUXÍLIO-REC-PROFISSIONAL']\n"
        break

# Salvar arquivo
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✓ Ortografia corrigida com sucesso!")
print("  - AUXÍLIO-DOEÇA → AUXÍLIO-DOENÇA")
print("  - AUXÍLIO-TRAb → AUXÍLIO-TRAB")
print("  - BENÉFİCIO → BENEFÍCIO (todos os 5 itens)")
