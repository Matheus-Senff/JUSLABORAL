import re

filepath = "src/components/ProcessDetailView.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Correções de ortografia
replacements = [
    ("'AUXÍLIO-DOEÇA'", "'AUXÍLIO-DOENÇA'"),
    ("'AUXÍLIO-TRAb-ACIDENTE'", "'AUXÍLIO-TRAB-ACIDENTE'"),
    ("'AVENT-RÁPIDA-FĀMLIA'", "'APOSENTADORIA-RÁPIDA-FAMÍLIA'"),
    ("BENÉFİCIO", "BENEFÍCIO"),
    ("'BUSC-ATIVO-INFORMACAO'", "'BUSCA-ATIVO-INFORMAÇÃO'"),
    ("'CERTIDAO", "'CERTIDÃO"),
    ("INFORMACAO'", "INFORMAÇÃO'"),
    ("SOLICITACAO", "SOLICITAÇÃO"),
    ("COPIA", "CÓPIA"),
    ("DOENCA'", "DOENÇA'"),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Arquivo corrigido com sucesso!")
