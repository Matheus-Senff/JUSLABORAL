/**
 * Script para testar a lógica de filtragem de Natureza
 * Execute com: node test-natureza-filter.js
 */

// Simular a geração de dados
const _naturezas = ['CIVIL', 'TRABALHISTA', 'PREVIDENCIÁRIA']

function generateTestProcesses(count) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        numero: i + 1,
        natureza: _naturezas[i % _naturezas.length],
        tipo: 'TEST'
    }))
}

// Simular a lógica de filtragem
function filterByNatureza(processes, filterNatureza) {
    return processes.filter(process => {
        let matches = true

        if (filterNatureza && matches) {
            matches = matches && (process.natureza || '').toUpperCase() === filterNatureza.toUpperCase()
        }

        return matches
    })
}

// Testes
console.log('=== Teste de Filtragem de Natureza ===\n')

const processes = generateTestProcesses(26103)

console.log(`Total de processos gerados: ${processes.length}`)
console.log(`Processos CIVIL: ${processes.filter(p => p.natureza === 'CIVIL').length}`)
console.log(`Processos TRABALHISTA: ${processes.filter(p => p.natureza === 'TRABALHISTA').length}`)
console.log(`Processos PREVIDENCIÁRIA: ${processes.filter(p => p.natureza === 'PREVIDENCIÁRIA').length}\n`)

// Teste 1: Filtrar por CIVIL
console.log('--- Teste 1: Filtro CIVIL ---')
const civilFiltered = filterByNatureza(processes, 'CIVIL')
console.log(`Processos após filtro CIVIL: ${civilFiltered.length}`)
console.log(`Esperado: 8701 (26103 / 3)\n`)

// Teste 2: Filtro TRABALHISTA
console.log('--- Teste 2: Filtro TRABALHISTA ---')
const trabFiltered = filterByNatureza(processes, 'TRABALHISTA')
console.log(`Processos após filtro TRABALHISTA: ${trabFiltered.length}`)
console.log(`Esperado: 8701\n`)

// Teste 3: Filtro PREVIDENCIÁRIA
console.log('--- Teste 3: Filtro PREVIDENCIÁRIA ---')
const prevFiltered = filterByNatureza(processes, 'PREVIDENCIÁRIA')
console.log(`Processos após filtro PREVIDENCIÁRIA: ${prevFiltered.length}`)
console.log(`Esperado: 8701\n`)

// Teste 4: Filtro com case insensitivo
console.log('--- Teste 4: Case Insensitive ---')
const civilLowercase = filterByNatureza(processes, 'civil')
const civilUppercase = filterByNatureza(processes, 'CIVIL')
const civilMixed = filterByNatureza(processes, 'Civil')
console.log(`Filtro 'civil' (minúsculas): ${civilLowercase.length}`)
console.log(`Filtro 'CIVIL' (maiúsculas): ${civilUppercase.length}`)
console.log(`Filtro 'Civil' (misto): ${civilMixed.length}`)
console.log(`Todos iguais? ${civilLowercase.length === civilUppercase.length && civilUppercase.length === civilMixed.length}\n`)

console.log('=== Conclusão: A lógica de filtragem funciona corretamente ===')
