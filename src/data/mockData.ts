/**
 * Dados geográficos reais — mantidos para uso em formulários.
 * Dados de usuários, parceiros e processos agora são gerenciados pelo Supabase.
 */

// Array vazio — usuários vêm do Supabase via useSupabaseUsuarios
export const mockUsers: { id: string; name: string; email: string }[] = []

// Array vazio — parceiros vêm do Supabase via useSupabaseParceiros
export const mockParceiros: string[] = []

// Estados brasileiros (dados reais)
export const mockUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

// Cidades principais (dados reais)
export const mockCidades = [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Maceió', 'Teresina', 'Campo Grande',
    'Natal', 'Florianópolis', 'São Luís', 'Maceió', 'Vitória',
]

// Status disponíveis para processos
export const statusOptions = [
    'Não Ajuizado',
    'Ajuizado',
    'Pendência',
    'Aguardando Documento',
    'Pendência Cumprida',
    'Aguardando Ajuizamento',
    'Arquivado',
]
