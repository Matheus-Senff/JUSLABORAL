#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys

file_path = r"src\components\ProcessDetailView.tsx"

print(f"Abrindo arquivo: {file_path}")

with open(file_path, 'r', encoding='utf-8-sig') as f:
    content = f.read()

# Debug: Verificar se o padrão antigo existe
test_strings = [
    'AUXÍLIO-DOEÇA',
    'AUXÍLIO-TRAb-ACIDENTE',
    'BENÉFİCIO',
    'BENEFÍCIO-ASSISTENCIAL-IDOSO'
]

print("\nVerificando padrões antigos:")
for s in test_strings:
    if s in content:
        print(f"  ✓ Encontrado: {repr(s)}")
    else:
        print(f"  ✗ NÃO encontrado: {repr(s)}")

# Fazer as substituições
old_content = content

content = content.replace('AUXÍLIO-DOEÇA', 'AUXÍLIO-DOENÇA')
content = content.replace('AUXÍLIO-TRAb-ACIDENTE', 'AUXÍLIO-TRAB-ACIDENTE')
content = content.replace('BENÉFİCIO', 'BENEFÍCIO')

if content != old_content:
    print("\n✓ Mudanças detectadas!")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Arquivo salvo com sucesso!")
else:
    print("\n✗ Nenhuma mudança foi feita!")
    sys.exit(1)
