/**
 * Arquivo centralizado de dados de teste/demonstração
 * Remova este arquivo quando migrar para banco de dados real
 */

// Usuários genéricos para demonstração
export const mockUsers = [
    { id: 'geral', name: 'Filtro Responsável', email: 'visualizar@sistema.com' },
    { id: '1', name: 'Usuário 1', email: 'usuario1@sistema.com' },
    { id: '2', name: 'Usuário 2', email: 'usuario2@sistema.com' },
    { id: '3', name: 'Usuário 3', email: 'usuario3@sistema.com' },
    { id: '4', name: 'Usuário 4', email: 'usuario4@sistema.com' },
    { id: '5', name: 'Usuário 5', email: 'usuario5@sistema.com' },
]

// Parceiros genéricos
export const mockParceiros = [
    'Parceiro 1',
    'Parceiro 2',
    'Parceiro 3',
    'Parceiro 4',
    'Parceiro 5',
    'Parceiro 6',
    'Parceiro 7',
    'Parceiro 8',
]

// Estados brasileiros
export const mockUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

// Cidades
export const mockCidades = [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Guardas', 'Maceió', 'Teresina',
]

// Gerar cliente fake
export function generateMockClient(id: number) {
    return {
        id: `client-${id}`,
        parceiro: mockParceiros[id % mockParceiros.length],
        nome: `Cliente ${id}`,
        cpf: `${String(id).padStart(11, '0')}`,
        cat: `${id}/2026`,
        cidade: mockCidades[id % mockCidades.length],
        uf: mockUFs[id % mockUFs.length],
        dataInicio: new Date(2024, Math.random() * 12, Math.random() * 28 + 1).toISOString().split('T')[0],
        status: ['AG AJUIZAR 8', 'ARQUIVADO', 'PRECATÓRIO'][id % 3],
    }
}

// Gerar processo fake
export function generateMockProcess(id: number, type: 'estadual' | 'federal' = 'estadual') {
    const statuses = ['Não Ajuizado', 'Ajuizado', 'Pendência', 'Aguardando Documento', 'Pendência Cumprida', 'Aguardando Ajuizamento', 'Arquivado']
    return {
        id: `proc-${id}`,
        parceiro: mockParceiros[id % mockParceiros.length],
        cliente: `Cliente ${id}`,
        cpf: `${String(id).padStart(11, '0')}`,
        numero: `${id}`,
        comarca: mockCidades[id % mockCidades.length],
        uf: mockUFs[id % mockUFs.length],
        dataInicio: new Date(2023, Math.random() * 12, Math.random() * 28 + 1).toISOString().split('T')[0],
        status: statuses[id % statuses.length],
        type,
    }
}

// Status options para filtros
export const statusOptions = [
    { label: 'Não Ajuizado', count: 3214 },
    { label: 'Ajuizado', count: 8756 },
    { label: 'Pendência', count: 4521 },
    { label: 'Aguardando Documento', count: 2847 },
    { label: 'Pendência Cumprida', count: 3691 },
    { label: 'Aguardando Ajuizamento', count: 2145 },
    { label: 'Arquivado', count: 929 },
]
