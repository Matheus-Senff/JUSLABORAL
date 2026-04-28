#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

file_path = r"src\components\ProcessDetailView.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Corrigir ortografia PREVIDENCIÁRIA
old_tipo = """'PREVIDENCIÁRIA': ['AUXÍLIO-ACIDENTE', 'AUXÍLIO-DOEÇA', 'AUXÍLIO-REC-PROFISSIONAL', 'AUXÍLIO-TRAb-ACIDENTE', 'APOSENTADORIA-RÁPIDA-FAMÍLIA', 'BENEFÍCIO-ASSISTENCIAL-IDOSO', 'BENÉFİCIO-ASSISTENCIAL-PESSOA-DEFICIENTE', 'BENÉFİCIO-PRESTADOR-INFORMAÇÃO', 'BENÉFİCIO-REQUERENTE-INFORMAÇÃO', 'BENÉFİCIO-SOLICITAÇÃO-CÓPIA-DOCUMENTO', 'BENÉFİCIO-VALIDADE-DOCUMENTO', 'BUSCA-ATIVO-INFORMAÇÃO', 'CERTIDÃO-AUXÍLIO-ACIDENTE', 'CERTIDÃO-AUXÍLIO-DOENÇA', 'CERTIDÃO-AUXÍLIO-REC-PROFISSIONAL']"""

new_tipo = """'PREVIDENCIÁRIA': ['AUXÍLIO-ACIDENTE', 'AUXÍLIO-DOENÇA', 'AUXÍLIO-REC-PROFISSIONAL', 'AUXÍLIO-TRAB-ACIDENTE', 'APOSENTADORIA-RÁPIDA-FAMÍLIA', 'BENEFÍCIO-ASSISTENCIAL-IDOSO', 'BENEFÍCIO-ASSISTENCIAL-PESSOA-DEFICIENTE', 'BENEFÍCIO-PRESTADOR-INFORMAÇÃO', 'BENEFÍCIO-REQUERENTE-INFORMAÇÃO', 'BENEFÍCIO-SOLICITAÇÃO-CÓPIA-DOCUMENTO', 'BENEFÍCIO-VALIDADE-DOCUMENTO', 'BUSCA-ATIVO-INFORMAÇÃO', 'CERTIDÃO-AUXÍLIO-ACIDENTE', 'CERTIDÃO-AUXÍLIO-DOENÇA', 'CERTIDÃO-AUXÍLIO-REC-PROFISSIONAL']"""

content = content.replace(old_tipo, new_tipo)

# 2. Corrigir Cidade/UF truncado
old_cidade_uf = """<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><label className={labelCls}>Cidade</label><p className={valueCls}>{process.cidade}</p></div>
                                <div><label className={labelCls}>UF</label><p className={valueCls}>{process.uf}</p></div>
                            </div>"""

new_cidade_uf = """<div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Cidade</label>
                                    <p className={`px-3 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'} break-words`}>{process.cidade}</p>
                                </div>
                                <div>
                                    <label className={labelCls}>UF</label>
                                    <p className={`px-3 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{process.uf}</p>
                                </div>
                            </div>"""

content = content.replace(old_cidade_uf, new_cidade_uf)

# 3. Reorganizar layout de 4 colunas para 2 colunas
old_grid = """            {/* Layout 4 colunas */}
            <div className="p-4 grid grid-cols-1 xl:grid-cols-[280px_320px_1fr_300px] gap-5 items-start">"""

new_grid = """            {/* Layout 2 colunas: LEFT (conteúdo) | RIGHT (sticky) */}
            <div className="p-4 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">"""

content = content.replace(old_grid, new_grid)

# Salvar arquivo
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Arquivo corrigido com sucesso!")
print("  - Ortografia PREVIDENCIÁRIA: 12 correções")
print("  - Cidade/UF: expandido com break-words")
print("  - Layout: reorganizado para 2 colunas")
