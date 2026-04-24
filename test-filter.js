// Simular os dados e a lógica de filtragem
const _naturezas = ['CIVIL', 'TRABALHISTA', 'PREVIDENCIÁRIA']

// Simular geração de 10 processos para teste
const testProcesses = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    natureza: _naturezas[i % _naturezas.length],
    tipo: 'TEST'
}))

console.log('=== Test Processes ===')
testProcesses.forEach(p => {
    console.log(`ID: ${p.id}, Natureza: ${p.natureza}`)
})

// Simular filtro
const filters = { natureza: 'CIVIL' }

// Simular a lógica de filtragem do código
let filtered = testProcesses.filter(process => {
    let matches = true

    // Natureza
    if (filters.natureza && matches) {
        matches = matches && (process.natureza || '').toUpperCase() === filters.natureza.toUpperCase()
    }

    return matches
})

console.log('\n=== Filtered Results (Natureza = CIVIL) ===')
console.log(`Total filtrado: ${filtered.length}`)
filtered.forEach(p => {
    console.log(`ID: ${p.id}, Natureza: ${p.natureza}`)
})

// Agora testar com 26103 para ver a distribuição
const all26103 = Array.from({ length: 26103 }, (_, i) => ({
    id: i + 1,
    natureza: _naturezas[i % _naturezas.length]
}))

const filterCivil = all26103.filter(p => p.natureza === 'CIVIL')
const filterTrab = all26103.filter(p => p.natureza === 'TRABALHISTA')
const filterPrev = all26103.filter(p => p.natureza === 'PREVIDENCIÁRIA')

console.log('\n=== Distribution for 26103 Processes ===')
console.log(`CIVIL: ${filterCivil.length}`)
console.log(`TRABALHISTA: ${filterTrab.length}`)
console.log(`PREVIDENCIÁRIA: ${filterPrev.length}`)
