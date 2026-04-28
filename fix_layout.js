const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ProcessDetailView.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove o campo Andamento (dropdown) mantendo Setor, Responsável, Status
// Encontra e remove apenas a seção do dropdown "Andamento"
const andamentoFieldRegex = /\s*<div>\s*<label className=\{labelCls\}>Andamento<\/label>\s*<div className="relative">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
content = content.replace(andamentoFieldRegex, '\n                            </div>');

// 2. Remove showAndamentoDropdown do estado de dropdowns
content = content.replace(/setShowAndamentoDropdown\(.*?\);/g, '');
content = content.replace(/setShowAndamentoDropdown\(/g, '/* removed */');

// 3. Remove as linhas que atualizam andamento em editForm
content = content.replace(/andamento:\s*process\.andamento\s*\|\|\s*'',\n/g, '');
content = content.replace(/andamento:\s*editForm\.andamento\s*\|\|\s*'',\n/g, '');

// 4. Garante que o histórico só atualiza ao salvar (remove handleStatusChange imediato)
// Substitui handleStatusChange para apenas atualizar o editForm, não o histórico imediatamente
const handleStatusChangeRegex = /const handleStatusChange = \(newStatus: string\) => \{[\s\S]*?setShowStatusDropdown\(false\)\s*\}/;
const newHandleStatusChange = `const handleStatusChange = (newStatus: string) => {
        setEditForm(f => ({ ...f, status: newStatus }))
        setShowStatusDropdown(false)
    }`;
content = content.replace(handleStatusChangeRegex, newHandleStatusChange);

// 5. Garante que Tipo não deixa espaço em branco quando não tem Natureza
// O Tipo já está condicionado a editForm.natureza, então está OK

// Escreve de volta
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Todas as mudanças foram aplicadas com sucesso!');
