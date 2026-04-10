import { Router, Request, Response } from 'express'
import { executarCalculo, CalculoInput } from '../lib/calculoEngine.js'

const router = Router()

// POST /api/calculo — Executa cálculo previdenciário completo
router.post('/', (req: Request, res: Response) => {
  const input = req.body as CalculoInput

  // Validação dos campos obrigatórios
  if (!input.dataInicioCalculo || !input.dataTerminoCalculo) {
    return res.status(400).json({
      error: 'Campos obrigatórios ausentes: dataInicioCalculo, dataTerminoCalculo',
    })
  }

  if (!input.rmi && !input.fixarSalarioMinimo) {
    return res.status(400).json({
      error: 'RMI deve ser informada ou fixarSalarioMinimo deve ser true',
    })
  }

  try {
    const resultado = executarCalculo(input)
    return res.json(resultado)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno no cálculo'
    return res.status(422).json({ error: message })
  }
})

// GET /api/calculo/indices — Retorna lista de índices disponíveis e períodos
router.get('/indices', (_req: Request, res: Response) => {
  return res.json({
    cadeia: [
      { indice: 'IGP-DI', periodo: '05/1996 a 08/2006', fonte: 'FGV/IBRE', lei: 'Lei 9.711/98' },
      { indice: 'INPC', periodo: '09/2006 a 11/2021', fonte: 'IBGE', lei: 'Lei 8.213/91, STJ Tema 905' },
      { indice: 'SELIC', periodo: '12/2021 em diante', fonte: 'BCB', lei: 'EC 113/2021, Res. 448/2022 CNJ' },
    ],
    selicModo: 'simples (soma das taxas mensais + 1% mês pgto.)',
    precatorio: { indice: 'IPCA', juros: '2% a.a.', lei: 'EC 136/2025' },
    nota: 'Cálculo atualizado conforme EC 113/2021 e Resolução 448/2022 do CNJ (Taxa SELIC).',
  })
})

export default router
