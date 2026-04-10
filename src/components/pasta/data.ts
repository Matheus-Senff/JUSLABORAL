import { KanbanBoard } from './types'

export const mockBoard: KanbanBoard = {
  id: 'board-1',
  title: 'Quadro de Documentos',
  starred: true,
  members: ['Ana Silva', 'Lucas Mendes', 'Bia Costa', 'Carlos Ramos', 'Fernanda Oliveira', 'Roberto Dias'],
  backgroundColor: 'default',
  customFields: [
    { id: 'cf-1', name: 'Nº do Processo', type: 'text' as const },
    { id: 'cf-2', name: 'Valor da Causa (R$)', type: 'number' as const },
    { id: 'cf-3', name: 'Prioridade', type: 'dropdown' as const, options: ['Alta', 'Média', 'Baixa'] },
    { id: 'cf-4', name: 'Revisado', type: 'checkbox' as const },
  ],
  templates: [
    {
      id: 'tpl-1',
      name: 'Documento Trabalhista',
      description: 'Template para documentação trabalhista padrão.',
      cover: 'blue',
      labels: [{ id: 'tpl-lbl-1', text: 'Trabalhista', color: 'blue' as const }],
      checklists: [
        { id: 'tpl-cl-1', title: 'Documentos necessários', items: [
          { id: 'tpl-cli-1', text: 'CTPS', done: false },
          { id: 'tpl-cli-2', text: 'Holerites (12 meses)', done: false },
          { id: 'tpl-cli-3', text: 'Extrato FGTS', done: false },
          { id: 'tpl-cli-4', text: 'Procuração ad judicia', done: false },
        ]}
      ]
    },
    {
      id: 'tpl-2',
      name: 'Petição Inicial',
      description: 'Template estruturado para petições iniciais.',
      cover: 'purple',
      labels: [{ id: 'tpl-lbl-2', text: 'Petição', color: 'purple' as const }],
      checklists: [
        { id: 'tpl-cl-2', title: 'Estrutura da petição', items: [
          { id: 'tpl-cli-5', text: 'Qualificação das partes', done: false },
          { id: 'tpl-cli-6', text: 'Dos fatos', done: false },
          { id: 'tpl-cli-7', text: 'Do direito', done: false },
          { id: 'tpl-cli-8', text: 'Dos pedidos', done: false },
          { id: 'tpl-cli-9', text: 'Valor da causa', done: false },
        ]}
      ]
    },
    {
      id: 'tpl-3',
      name: 'Reunião de Equipe',
      description: 'Pauta padrão para reuniões do escritório.',
      cover: 'green',
      labels: [{ id: 'tpl-lbl-3', text: 'Reunião', color: 'green' as const }],
      checklists: [
        { id: 'tpl-cl-3', title: 'Pauta', items: [
          { id: 'tpl-cli-10', text: 'Revisão de pendências', done: false },
          { id: 'tpl-cli-11', text: 'Novos casos', done: false },
          { id: 'tpl-cli-12', text: 'Prazos da semana', done: false },
        ]}
      ]
    },
    {
      id: 'tpl-4',
      name: 'Perícia Técnica',
      description: 'Template para acompanhamento de perícia.',
      cover: 'orange',
      labels: [{ id: 'tpl-lbl-4', text: 'Perícia', color: 'orange' as const }],
      checklists: [
        { id: 'tpl-cl-4', title: 'Etapas da perícia', items: [
          { id: 'tpl-cli-13', text: 'Designação do perito', done: false },
          { id: 'tpl-cli-14', text: 'Visita ao local', done: false },
          { id: 'tpl-cli-15', text: 'Entrega do laudo', done: false },
          { id: 'tpl-cli-16', text: 'Impugnação', done: false },
        ]}
      ]
    },
  ],
  automations: [
    {
      id: 'auto-1',
      name: 'Concluído → Marcar data como feita',
      trigger: { type: 'card_moved_to_column' as const, columnId: 'col-4' },
      action: { type: 'set_due_date_done' as const },
      enabled: true,
    },
    {
      id: 'auto-2',
      name: 'Em Análise → Adicionar etiqueta Análise',
      trigger: { type: 'card_moved_to_column' as const, columnId: 'col-2' },
      action: { type: 'add_label' as const, labelColor: 'yellow' as const },
      enabled: false,
    },
    {
      id: 'auto-3',
      name: 'Aguardando Aprovação → Adicionar etiqueta Atenção',
      trigger: { type: 'card_moved_to_column' as const, columnId: 'col-3' },
      action: { type: 'add_label' as const, labelColor: 'orange' as const },
      enabled: false,
    },
  ],
  activity: [
    { id: 'act-1', description: 'criou o cartão "CTPS e Holerites - Maria Souza"', actor: 'Ana Silva', timestamp: '07/04/2026 09:00' },
    { id: 'act-2', description: 'moveu "Petição inicial" para Em Análise', actor: 'Lucas Mendes', timestamp: '08/04/2026 14:00' },
    { id: 'act-3', description: 'comentou em "Laudo pericial - Insalubridade João P."', actor: 'Carlos Ramos', timestamp: '10/04/2026 08:00' },
    { id: 'act-4', description: 'criou a lista "Concluído"', actor: 'Master', timestamp: '01/04/2026 09:00' },
    { id: 'act-5', description: 'protocolou "Protocolar petição no PJe" com sucesso', actor: 'Ana Silva', timestamp: '10/04/2026 11:00' },
    { id: 'act-6', description: 'adicionou 2 anexos em "CTPS e Holerites - Maria Souza"', actor: 'Ana Silva', timestamp: '08/04/2026 14:05' },
    { id: 'act-7', description: 'finalizou a minuta de acordo para o caso Ferreira', actor: 'Bia Costa', timestamp: '10/04/2026 16:45' },
  ],
  columns: [
    {
      id: 'col-1',
      title: 'Documentos Pendentes',
      position: 0,
      color: 'orange',
      cards: [
        {
          id: 'card-1',
          title: 'CTPS e Holerites - Maria Souza',
          description: 'Solicitar ao cliente cópia da CTPS (páginas com contratos) e últimos 12 holerites para cálculo de verbas rescisórias.',
          labels: [
            { id: 'lbl-1', text: 'Urgente', color: 'red' },
            { id: 'lbl-2', text: 'Trabalhista', color: 'blue' }
          ],
          members: ['Ana Silva'],
          dueDate: '2026-04-15',
          checklists: [
            {
              id: 'cl-1',
              title: 'Documentos necessários',
              items: [
                { id: 'cli-1', text: 'CTPS - páginas de identificação', done: true },
                { id: 'cli-2', text: 'CTPS - contratos de trabalho', done: false },
                { id: 'cli-3', text: 'Últimos 12 holerites', done: false },
                { id: 'cli-4', text: 'Extrato FGTS', done: false },
                { id: 'cli-5', text: 'TRCT (Termo de Rescisão)', done: false }
              ]
            }
          ],
          comments: [
            { id: 'cmt-1', author: 'Ana Silva', text: 'Cliente informou que enviará os holerites por e-mail até sexta.', createdAt: '09/04/2026 09:30' }
          ],
          attachments: [
            { id: 'att-1', name: 'CTPS_Maria_Souza_pag1.pdf', url: '#', type: 'pdf', size: '1.2 MB', addedBy: 'Ana Silva', addedAt: '08/04/2026 14:00' },
            { id: 'att-2', name: 'Procuracao_ad_judicia.pdf', url: '#', type: 'pdf', size: '340 KB', addedBy: 'Ana Silva', addedAt: '08/04/2026 14:05' }
          ],
          cover: 'red', startDate: '2026-04-07', dueDateDone: false, watched: true,
          customFieldValues: [
            { fieldId: 'cf-1', value: '0001234-56.2026.5.12.0001' },
            { fieldId: 'cf-2', value: '28000' },
            { fieldId: 'cf-3', value: 'Alta' },
            { fieldId: 'cf-4', value: 'false' },
          ],
          archived: false, position: 0, columnId: 'col-1', createdAt: '07/04/2026'
        },
        {
          id: 'card-2',
          title: 'Contrato Social - Empresa ABC Ltda',
          description: 'Coletar documentação societária completa para nova ação.',
          labels: [
            { id: 'lbl-3', text: 'Empresarial', color: 'purple' }
          ],
          members: ['Bia Costa'],
          dueDate: '2026-04-18',
          checklists: [
            {
              id: 'cl-2',
              title: 'Docs societários',
              items: [
                { id: 'cli-6', text: 'Contrato Social atualizado', done: true },
                { id: 'cli-7', text: 'Alterações contratuais', done: false },
                { id: 'cli-8', text: 'Certidão CNPJ', done: true },
                { id: 'cli-9', text: 'Procuração com poderes específicos', done: false }
              ]
            }
          ],
          comments: [],
          attachments: [
            { id: 'att-3', name: 'Contrato_Social_ABC.pdf', url: '#', type: 'pdf', size: '2.8 MB', addedBy: 'Bia Costa', addedAt: '07/04/2026 10:20' },
            { id: 'att-4', name: 'Certidao_CNPJ.pdf', url: '#', type: 'pdf', size: '156 KB', addedBy: 'Bia Costa', addedAt: '07/04/2026 10:25' }
          ],
          cover: 'purple', startDate: '', dueDateDone: false, watched: false, customFieldValues: [
            { fieldId: 'cf-1', value: '' },
            { fieldId: 'cf-2', value: '45000' },
            { fieldId: 'cf-3', value: 'Média' },
            { fieldId: 'cf-4', value: 'false' },
          ],
          archived: false, position: 1, columnId: 'col-1', createdAt: '06/04/2026'
        },
        {
          id: 'card-3',
          title: 'Laudo pericial - Insalubridade João P.',
          description: 'Solicitar laudo de insalubridade ao perito nomeado. Prazo do juízo: 25/04.',
          labels: [
            { id: 'lbl-4', text: 'Perícia', color: 'orange' },
            { id: 'lbl-5', text: 'Prazo judicial', color: 'red' }
          ],
          members: ['Carlos Ramos'],
          dueDate: '2026-04-25',
          checklists: [],
          comments: [
            { id: 'cmt-2', author: 'Carlos Ramos', text: 'Perito confirmou visita ao local para dia 15/04.', createdAt: '10/04/2026 08:00' }
          ],
          attachments: [],
          cover: '', startDate: '', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 2, columnId: 'col-1', createdAt: '05/04/2026'
        },
        {
          id: 'card-4',
          title: 'Comprovantes de pagamento - Rescisão',
          description: 'Reunir todos os comprovantes de pagamento: salários, férias, 13º, FGTS, multa 40%.',
          labels: [
            { id: 'lbl-6', text: 'Financeiro', color: 'green' }
          ],
          members: ['Fernanda Oliveira'],
          dueDate: '2026-04-20',
          checklists: [
            {
              id: 'cl-3',
              title: 'Comprovantes',
              items: [
                { id: 'cli-10', text: 'Comprovante saldo de salário', done: false },
                { id: 'cli-11', text: 'Comprovante férias proporcionais', done: false },
                { id: 'cli-12', text: 'Comprovante 13º proporcional', done: false },
                { id: 'cli-13', text: 'Guia FGTS + multa 40%', done: false }
              ]
            }
          ],
          comments: [],
          attachments: [],
          cover: 'green', startDate: '', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 3, columnId: 'col-1', createdAt: '08/04/2026'
        },
        {
          id: 'card-5',
          title: 'Atestados médicos - Acidente de trabalho',
          description: 'Reunir todos os atestados e relatórios médicos para instruir ação de indenização por acidente de trabalho.',
          labels: [
            { id: 'lbl-7', text: 'Saúde', color: 'yellow' },
            { id: 'lbl-8', text: 'Trabalhista', color: 'blue' }
          ],
          members: ['Lucas Mendes'],
          dueDate: '2026-04-22',
          checklists: [
            {
              id: 'cl-4',
              title: 'Documentação médica',
              items: [
                { id: 'cli-14', text: 'CAT (Comunicação de Acidente)', done: true },
                { id: 'cli-15', text: 'Atestado do médico do trabalho', done: true },
                { id: 'cli-16', text: 'Laudo do INSS', done: false },
                { id: 'cli-17', text: 'Exames complementares', done: false },
                { id: 'cli-18', text: 'Fotos do local do acidente', done: false }
              ]
            }
          ],
          comments: [
            { id: 'cmt-3', author: 'Lucas Mendes', text: 'CAT obtida. INSS ainda não liberou o laudo.', createdAt: '09/04/2026 16:30' }
          ],
          attachments: [
            { id: 'att-5', name: 'CAT_Comunicacao_Acidente.pdf', url: '#', type: 'pdf', size: '890 KB', addedBy: 'Lucas Mendes', addedAt: '09/04/2026 16:00' },
            { id: 'att-6', name: 'Atestado_Medico_Trabalho.pdf', url: '#', type: 'pdf', size: '420 KB', addedBy: 'Lucas Mendes', addedAt: '09/04/2026 16:10' },
            { id: 'att-7', name: 'foto_local_acidente.jpg', url: '#', type: 'image', size: '3.1 MB', addedBy: 'Lucas Mendes', addedAt: '09/04/2026 16:15' }
          ],
          cover: '', startDate: '2026-04-04', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 4, columnId: 'col-1', createdAt: '04/04/2026'
        }
      ]
    },
    {
      id: 'col-2',
      title: 'Em Análise',
      position: 1,
      color: 'blue',
      cards: [
        {
          id: 'card-6',
          title: 'Petição inicial - Verbas rescisórias',
          description: 'Construir tese principal para reclamação trabalhista. Rescisão indireta art. 483 CLT.',
          labels: [
            { id: 'lbl-9', text: 'Petição', color: 'purple' },
            { id: 'lbl-10', text: 'Prioridade', color: 'yellow' }
          ],
          members: ['Lucas Mendes', 'Ana Silva'],
          dueDate: '2026-04-26',
          checklists: [
            {
              id: 'cl-5',
              title: 'Etapas da petição',
              items: [
                { id: 'cli-19', text: 'Qualificação das partes', done: true },
                { id: 'cli-20', text: 'Dos fatos', done: true },
                { id: 'cli-21', text: 'Do direito', done: false },
                { id: 'cli-22', text: 'Dos pedidos', done: false },
                { id: 'cli-23', text: 'Valor da causa', done: false }
              ]
            }
          ],
          comments: [
            { id: 'cmt-4', author: 'Ana Silva', text: 'Tese definida: rescisão indireta art. 483 CLT.', createdAt: '09/04/2026 14:15' },
            { id: 'cmt-5', author: 'Lucas Mendes', text: 'Faltam dados do CTPS. Solicitei ao cliente.', createdAt: '10/04/2026 10:00' }
          ],
          attachments: [
            { id: 'att-8', name: 'Minuta_Peticao_v2.docx', url: '#', type: 'doc', size: '145 KB', addedBy: 'Lucas Mendes', addedAt: '09/04/2026 15:00' },
            { id: 'att-9', name: 'Jurisprudencia_TST.pdf', url: '#', type: 'pdf', size: '2.1 MB', addedBy: 'Ana Silva', addedAt: '09/04/2026 16:30' }
          ],
          cover: 'blue', startDate: '2026-04-05', dueDateDone: false, watched: true,
          customFieldValues: [
            { fieldId: 'cf-1', value: '0005678-91.2026.5.12.0002' },
            { fieldId: 'cf-2', value: '52000' },
            { fieldId: 'cf-3', value: 'Alta' },
            { fieldId: 'cf-4', value: 'false' },
          ],
          archived: false, position: 0, columnId: 'col-2', createdAt: '05/04/2026'
        },
        {
          id: 'card-7',
          title: 'Recurso ordinário - TRT-12',
          description: 'Verificar prazo e fundamentos. Prazo final 22/04.',
          labels: [
            { id: 'lbl-11', text: 'Recurso', color: 'blue' }
          ],
          members: ['Carlos Ramos'],
          dueDate: '2026-04-22',
          checklists: [],
          comments: [],
          attachments: [
            { id: 'att-10', name: 'Sentenca_1grau.pdf', url: '#', type: 'pdf', size: '1.5 MB', addedBy: 'Carlos Ramos', addedAt: '08/04/2026 09:00' }
          ],
          cover: '', startDate: '', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 1, columnId: 'col-2', createdAt: '06/04/2026'
        },
        {
          id: 'card-8',
          title: 'Análise de contrato de trabalho',
          description: 'Verificar cláusulas do contrato com possíveis irregularidades: banco de horas, jornada 12x36.',
          labels: [
            { id: 'lbl-12', text: 'Análise', color: 'orange' }
          ],
          members: ['Fernanda Oliveira'],
          dueDate: '2026-04-19',
          checklists: [
            {
              id: 'cl-6',
              title: 'Pontos de verificação',
              items: [
                { id: 'cli-24', text: 'Cláusula de banco de horas', done: true },
                { id: 'cli-25', text: 'Jornada de trabalho', done: true },
                { id: 'cli-26', text: 'Acordo de compensação', done: false },
                { id: 'cli-27', text: 'Cláusula de não-concorrência', done: false }
              ]
            }
          ],
          comments: [],
          attachments: [
            { id: 'att-11', name: 'Contrato_Trabalho_scan.pdf', url: '#', type: 'pdf', size: '3.4 MB', addedBy: 'Fernanda Oliveira', addedAt: '07/04/2026 11:00' }
          ],
          cover: 'orange', startDate: '', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 2, columnId: 'col-2', createdAt: '07/04/2026'
        },
        {
          id: 'card-9',
          title: 'Cálculo de liquidação - Precatório',
          description: 'Elaborar memória de cálculo para fase de liquidação. Aplicar SELIC a partir de 12/2021.',
          labels: [
            { id: 'lbl-13', text: 'Cálculo', color: 'green' },
            { id: 'lbl-14', text: 'Precatório', color: 'purple' }
          ],
          members: ['Roberto Dias'],
          dueDate: '2026-04-28',
          checklists: [],
          comments: [
            { id: 'cmt-6', author: 'Roberto Dias', text: 'Utilizando tabela SELIC atualizada do BCB.', createdAt: '10/04/2026 09:45' }
          ],
          attachments: [
            { id: 'att-12', name: 'Planilha_Calculo_v1.xlsx', url: '#', type: 'xls', size: '780 KB', addedBy: 'Roberto Dias', addedAt: '10/04/2026 09:00' },
            { id: 'att-13', name: 'Tabela_SELIC_2021_2026.pdf', url: '#', type: 'pdf', size: '210 KB', addedBy: 'Roberto Dias', addedAt: '10/04/2026 09:05' }
          ],
          cover: '', startDate: '', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 3, columnId: 'col-2', createdAt: '08/04/2026'
        }
      ]
    },
    {
      id: 'col-3',
      title: 'Aguardando Aprovação',
      position: 2,
      color: 'yellow',
      cards: [
        {
          id: 'card-10',
          title: 'Minuta de acordo - Caso Ferreira',
          description: 'Minuta pronta. Aguardando aprovação do cliente para envio à parte contrária.',
          labels: [
            { id: 'lbl-15', text: 'Aprovação', color: 'yellow' }
          ],
          members: ['Bia Costa'],
          dueDate: '2026-04-16',
          checklists: [
            {
              id: 'cl-7',
              title: 'Checklist de envio',
              items: [
                { id: 'cli-28', text: 'Revisão ortográfica', done: true },
                { id: 'cli-29', text: 'Conferir valores', done: true },
                { id: 'cli-30', text: 'Aprovação do sócio', done: false },
                { id: 'cli-31', text: 'Assinatura digital', done: false }
              ]
            }
          ],
          comments: [
            { id: 'cmt-7', author: 'Bia Costa', text: 'Minuta finalizada. Enviada para revisão do Dr. Carlos.', createdAt: '10/04/2026 16:45' }
          ],
          attachments: [
            { id: 'att-14', name: 'Minuta_Acordo_Ferreira_final.pdf', url: '#', type: 'pdf', size: '520 KB', addedBy: 'Bia Costa', addedAt: '10/04/2026 16:40' },
            { id: 'att-15', name: 'Contrato_Honorarios.pdf', url: '#', type: 'pdf', size: '290 KB', addedBy: 'Bia Costa', addedAt: '10/04/2026 16:42' }
          ],
          cover: 'yellow', startDate: '2026-04-03', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 0, columnId: 'col-3', createdAt: '03/04/2026'
        },
        {
          id: 'card-11',
          title: 'Parecer jurídico - Compliance',
          description: 'Parecer sobre adequação trabalhista da empresa XYZ ao eSocial.',
          labels: [
            { id: 'lbl-16', text: 'Parecer', color: 'blue' },
            { id: 'lbl-17', text: 'Empresarial', color: 'purple' }
          ],
          members: ['Carlos Ramos', 'Roberto Dias'],
          dueDate: '2026-04-17',
          checklists: [],
          comments: [],
          attachments: [
            { id: 'att-16', name: 'Parecer_Compliance_v3.pdf', url: '#', type: 'pdf', size: '1.8 MB', addedBy: 'Carlos Ramos', addedAt: '09/04/2026 18:00' }
          ],
          cover: 'blue', startDate: '', dueDateDone: false, watched: false, customFieldValues: [],
          archived: false, position: 1, columnId: 'col-3', createdAt: '02/04/2026'
        }
      ]
    },
    {
      id: 'col-4',
      title: 'Concluído',
      position: 3,
      color: 'green',
      cards: [
        {
          id: 'card-12',
          title: 'Protocolar petição no PJe',
          description: 'Petição protocolada com sucesso no PJe do TRT-12. Nº 0001234-56.2026.5.12.0001.',
          labels: [
            { id: 'lbl-18', text: 'Concluído', color: 'green' }
          ],
          members: ['Ana Silva'],
          dueDate: '2026-04-10',
          checklists: [],
          comments: [
            { id: 'cmt-8', author: 'Ana Silva', text: 'Protocolo realizado. Nº 0001234-56.2026.5.12.0001', createdAt: '10/04/2026 11:00' }
          ],
          attachments: [
            { id: 'att-17', name: 'Comprovante_Protocolo_PJe.pdf', url: '#', type: 'pdf', size: '95 KB', addedBy: 'Ana Silva', addedAt: '10/04/2026 11:05' },
            { id: 'att-18', name: 'Peticao_Protocolada.pdf', url: '#', type: 'pdf', size: '2.3 MB', addedBy: 'Ana Silva', addedAt: '10/04/2026 11:05' }
          ],
          cover: 'green', startDate: '', dueDateDone: true, watched: false, customFieldValues: [],
          archived: false, position: 0, columnId: 'col-4', createdAt: '01/04/2026'
        },
        {
          id: 'card-13',
          title: 'Reunião de alinhamento semanal',
          description: 'Reunião realizada. Prioridades definidas e tarefas distribuídas para a semana.',
          labels: [
            { id: 'lbl-19', text: 'Reunião', color: 'blue' }
          ],
          members: ['Ana Silva', 'Lucas Mendes', 'Bia Costa', 'Carlos Ramos'],
          dueDate: '2026-04-07',
          checklists: [],
          comments: [],
          attachments: [
            { id: 'att-19', name: 'Ata_Reuniao_07_04.pdf', url: '#', type: 'pdf', size: '180 KB', addedBy: 'Ana Silva', addedAt: '07/04/2026 17:00' }
          ],
          cover: '', startDate: '', dueDateDone: true, watched: false, customFieldValues: [],
          archived: false, position: 1, columnId: 'col-4', createdAt: '01/04/2026'
        },
        {
          id: 'card-14',
          title: 'Cadastro cliente - Souza Comércio',
          description: 'Cadastro completo. Procuração e contrato de honorários assinados.',
          labels: [
            { id: 'lbl-20', text: 'Concluído', color: 'green' },
            { id: 'lbl-21', text: 'Administrativo', color: 'orange' }
          ],
          members: ['Fernanda Oliveira'],
          dueDate: '2026-04-05',
          checklists: [],
          comments: [],
          attachments: [
            { id: 'att-20', name: 'Ficha_Cadastral_Souza.pdf', url: '#', type: 'pdf', size: '340 KB', addedBy: 'Fernanda Oliveira', addedAt: '05/04/2026 14:00' },
            { id: 'att-21', name: 'Procuracao_Assinada.pdf', url: '#', type: 'pdf', size: '210 KB', addedBy: 'Fernanda Oliveira', addedAt: '05/04/2026 14:05' },
            { id: 'att-22', name: 'Contrato_Honorarios_Assinado.pdf', url: '#', type: 'pdf', size: '450 KB', addedBy: 'Fernanda Oliveira', addedAt: '05/04/2026 14:10' }
          ],
          cover: '', startDate: '', dueDateDone: true, watched: false, customFieldValues: [],
          archived: false, position: 2, columnId: 'col-4', createdAt: '28/03/2026'
        },
        {
          id: 'card-15',
          title: 'Defesa audiência - Processo 5678',
          description: 'Defesa apresentada em audiência. Juiz designou perícia técnica.',
          labels: [
            { id: 'lbl-22', text: 'Audiência', color: 'orange' },
            { id: 'lbl-23', text: 'Concluído', color: 'green' }
          ],
          members: ['Carlos Ramos'],
          dueDate: '2026-04-03',
          checklists: [],
          comments: [
            { id: 'cmt-9', author: 'Carlos Ramos', text: 'Audiência realizada. Perícia designada para 20/05.', createdAt: '03/04/2026 17:00' }
          ],
          attachments: [
            { id: 'att-23', name: 'Ata_Audiencia_Proc5678.pdf', url: '#', type: 'pdf', size: '620 KB', addedBy: 'Carlos Ramos', addedAt: '03/04/2026 17:30' }
          ],
          cover: 'orange', startDate: '', dueDateDone: true, watched: false, customFieldValues: [],
          archived: false, position: 3, columnId: 'col-4', createdAt: '25/03/2026'
        }
      ]
    }
  ]
}
