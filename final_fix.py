#!/usr/bin/env python3
# -*- coding: utf-8 -*-

file_path = r"src\components\ProcessDetailView.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fazer todas as substituições
replacements = {
    'AUXÍLIO-DOEÇA': 'AUXÍLIO-DOENÇA',
    'AUXÍLIO-TRAb-ACIDENTE': 'AUXÍLIO-TRAB-ACIDENTE',
    'BENÉFİCIO': 'BENEFÍCIO',
}

for old, new in replacements.items():
    content = content.replace(old, new)
    print(f"✓ {old} → {new}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✓ Todas as correções aplicadas!")
