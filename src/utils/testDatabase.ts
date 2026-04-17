import { supabase } from '@/utils/supabase/client'

export async function testDatabase() {
    console.log('🧪 Iniciando testes do banco de dados...\n')

    try {
        // Teste 1: Verificar conexão
        console.log('1️⃣ Testando conexão com Supabase...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
            console.error('❌ Erro na conexão:', sessionError.message)
            return false
        }
        console.log('✅ Conexão estabelecida\n')

        // Teste 2: Verificar tabela compromissos
        console.log('2️⃣ Verificando se tabela "compromissos" existe...')
        const { data: tableData, error: tableError } = await supabase
            .from('compromissos')
            .select('*')
            .limit(1)

        if (tableError) {
            console.error('❌ Erro ao acessar tabela:', tableError.message)
            return false
        }
        console.log('✅ Tabela "compromissos" existe e está acessível\n')

        // Teste 3: Listar usuários autenticados (apenas se houver sessão)
        if (session?.user) {
            console.log('3️⃣ Usuário autenticado detectado')
            console.log('   Email:', session.user.email)
            console.log('   UID:', session.user.id, '\n')

            // Teste 4: Tentar inserir um compromisso de teste
            console.log('4️⃣ Testando inserção de compromisso...')
            const testCompromisso = {
                id: `test-${Date.now()}`,
                user_id: session.user.id,
                data: new Date().toISOString().split('T')[0],
                horario: '14:00',
                descricao: 'Teste de conexão',
                local: 'Sistema',
                prioridade: 'media',
                status: 'pendente',
            }

            const { data: inserted, error: insertError } = await supabase
                .from('compromissos')
                .insert([testCompromisso])
                .select()

            if (insertError) {
                console.error('❌ Erro ao inserir:', insertError.message)
                return false
            }
            console.log('✅ Compromisso inserido com sucesso!')
            console.log('   ID:', inserted?.[0]?.id, '\n')

            // Teste 5: Verificar os dados inseridos
            console.log('5️⃣ Buscando compromisso inserido...')
            const { data: fetched, error: fetchError } = await supabase
                .from('compromissos')
                .select('*')
                .eq('id', testCompromisso.id)
                .single()

            if (fetchError) {
                console.error('❌ Erro ao buscar:', fetchError.message)
                return false
            }
            console.log('✅ Compromisso encontrado!')
            console.log('   Descrição:', fetched?.descricao, '\n')

            // Teste 6: Atualizar compromisso
            console.log('6️⃣ Testando atualização...')
            const { data: updated, error: updateError } = await supabase
                .from('compromissos')
                .update({ status: 'concluido' })
                .eq('id', testCompromisso.id)
                .select()

            if (updateError) {
                console.error('❌ Erro ao atualizar:', updateError.message)
                return false
            }
            console.log('✅ Compromisso atualizado!')
            console.log('   Novo status:', updated?.[0]?.status, '\n')

            // Teste 7: Deletar compromisso
            console.log('7️⃣ Testando exclusão...')
            const { error: deleteError } = await supabase
                .from('compromissos')
                .delete()
                .eq('id', testCompromisso.id)

            if (deleteError) {
                console.error('❌ Erro ao deletar:', deleteError.message)
                return false
            }
            console.log('✅ Compromisso deletado com sucesso!\n')

            console.log('🎉 Todos os testes passaram!')
            return true
        } else {
            console.log('3️⃣ Nenhum usuário autenticado (faça login primeiro)')
            console.log('   Tabela existe e está acessível (RLS pode estar restringindo)\n')
            return true
        }
    } catch (err) {
        console.error('❌ Erro geral:', err)
        return false
    }
}

// Executar testes
testDatabase().then((success) => {
    if (success) {
        console.log('✅ Banco de dados testado com sucesso!')
    } else {
        console.error('❌ Testes falharam')
    }
})
