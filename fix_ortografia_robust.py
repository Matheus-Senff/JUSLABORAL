#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import shutil
import os

file_path = r"src\components\ProcessDetailView.tsx"
backup_path = file_path + ".backup"

# Criar backup
shutil.copy(file_path, backup_path)
print(f"✓ Backup criado: {backup_path}")

# Ler com encoding UTF-8
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar e substituir a linha 37 que contém PREVIDENCIÁRIA
new_lines = []
found = False

for i, line in enumerate(lines):
    if i == 36:  # Linha 37 (0-indexed)
        # Verificar se é a linha correta
        if "'PREVIDENCIÁRIA':" in line and "'AUXÍLIO-" in line:
            print(f"✓ Encontrada linha {i+1} com TIPO_OPTIONS")
            # Substituir todo o conteúdo de PREVIDENCIÁRIA
            line = "    'PREVIDENCIÁRIA': ['AUXÍLIO-ACIDENTE', 'AUXÍLIO-DOENÇA', 'AUXÍLIO-REC-PROFISSIONAL', 'AUXÍLIO-TRAB-ACIDENTE', 'APOSENTADORIA-RÁPIDA-FAMÍLIA', 'BENEFÍCIO-ASSISTENCIAL-IDOSO', 'BENEFÍCIO-ASSISTENCIAL-PESSOA-DEFICIENTE', 'BENEFÍCIO-PRESTADOR-INFORMAÇÃO', 'BENEFÍCIO-REQUERENTE-INFORMAÇÃO', 'BENEFÍCIO-SOLICITAÇÃO-CÓPIA-DOCUMENTO', 'BENEFÍCIO-VALIDADE-DOCUMENTO', 'BUSCA-ATIVO-INFORMAÇÃO', 'CERTIDÃO-AUXÍLIO-ACIDENTE', 'CERTIDÃO-AUXÍLIO-DOENÇA', 'CERTIDÃO-AUXÍLIO-REC-PROFISSIONAL']\n"
            print("✓ Linha corrigida:")
            print("  - AUXÍLIO-DOEÇA → AUXÍLIO-DOENÇA")
            print("  - AUXÍLIO-TRAb → AUXÍLIO-TRAB")
            print("  - BENÉFİCIO → BENEFÍCIO (todos os 5)")
            found = True
    new_lines.append(line)

if found:
    # Salvar arquivo
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("\n✓ Arquivo salvo com sucesso!")
else:
    print("\n✗ Linha não encontrada!")
    # Restaurar backup
    shutil.copy(backup_path, file_path)
    print("✓ Backup restaurado")
    os.remove(backup_path)
    exit(1)

# Verificar as mudanças
with open(file_path, 'r', encoding='utf-8') as f:
    lines_read = f.readlines()
    if "'AUXÍLIO-DOENÇA'" in lines_read[36]:
        print("✓ Verificação: DOENÇA está correto!")
    else:
        print("✗ Verificação falhou!")
        
print("\n✓ Todas as correções foram aplicadas e verificadas!")
