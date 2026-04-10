import { FormData } from '../contexts/CalculoContext'

// Tipos para os cálculos
export interface PeriodoCorrecao {
  inicio: Date
  fim: Date
  indice: 'IPCA-E' | 'SELIC'
  taxa?: number // para SELIC
}

export interface Parcela {
  competencia: string
  valorNominal: number
  valorCorrigido: number
  diasTrabalhados: number
  totalDiasMes: number
  proRata: number
}

// Cadeia de indexação conforme EC 113/2021 e Resolução 448/2022 CNJ
export function getCadeiaIndexacao(dataInicio: Date, dataFim: Date): PeriodoCorrecao[] {
  const periodos: PeriodoCorrecao[] = [];
  const inicioIpcaE = new Date(2011, 0, 1); // 01/2011
  const fimIpcaE = new Date(2021, 10, 30); // 30/11/2021
  const inicioSelic = new Date(2021, 11, 1); // 01/12/2021

  // IPCA-E de 01/2011 até 11/2021
  if (dataInicio <= fimIpcaE && dataFim >= inicioIpcaE) {
    const inicioPeriodo = dataInicio > inicioIpcaE ? dataInicio : inicioIpcaE;
    const fimPeriodo = dataFim < fimIpcaE ? dataFim : fimIpcaE;
    periodos.push({
      inicio: inicioPeriodo,
      fim: fimPeriodo,
      indice: 'IPCA-E'
    });
  }

  // SELIC a partir de 12/2021 (índice único, sem juros de mora extras)
  if (dataFim >= inicioSelic) {
    const inicioPeriodo = dataInicio > inicioSelic ? dataInicio : inicioSelic;
    periodos.push({
      inicio: inicioPeriodo,
      fim: dataFim,
      indice: 'SELIC'
    });
  }
  return periodos;
}

// Função para calcular dias trabalhados no mês (pro rata die, bloqueando dias futuros)
export function calcularDiasTrabalhados(
  competencia: string,
  dataInicioCalculo: Date,
  dataTerminoCalculo: Date
): { diasTrabalhados: number; totalDiasMes: number; proRata: number } {
  const [ano, mes] = competencia.split('/').map(Number);
  const primeiroDiaMes = new Date(ano, mes - 1, 1);
  const ultimoDiaMes = new Date(ano, mes, 0);
  const totalDiasMes = ultimoDiaMes.getDate();

  // Data de início efetiva para este mês
  const inicioEfetivo = primeiroDiaMes > dataInicioCalculo ? primeiroDiaMes : dataInicioCalculo;

  // Data de término efetiva para este mês (não pode ser futura)
  const hoje = new Date();
  const fimEfetivo = ultimoDiaMes < dataTerminoCalculo ? ultimoDiaMes : dataTerminoCalculo;
  const fimLimitado = fimEfetivo > hoje ? hoje : fimEfetivo;

  // Bloqueia geração de valores para dias futuros
  const diasTrabalhados = Math.max(0, Math.ceil((fimLimitado.getTime() - inicioEfetivo.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const proRata = diasTrabalhados / totalDiasMes;

  return { diasTrabalhados, totalDiasMes, proRata };
}

// Função para obter taxa SELIC acumulada (simplificada - em produção, consultar API do BACEN)
export function getTaxaSelicAcumulada(dataInicio: Date, dataFim: Date): number {
  // Implementação simplificada - em produção, consultar série histórica do BACEN
  // Taxa SELIC média aproximada para o período
  const meses = (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 +
                (dataFim.getMonth() - dataInicio.getMonth())

  // Taxa SELIC aproximada (valores reais devem vir de API)
  const taxaSelicMensal = 0.005 // 0.5% ao mês (exemplo)
  return Math.pow(1 + taxaSelicMensal, meses) - 1
}

// Função para obter IPCA-E acumulado (simplificada)
export function getIpcaEAcumulado(dataInicio: Date, dataFim: Date): number {
  // Implementação simplificada - em produção, consultar série histórica do IBGE
  const meses = (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 +
                (dataFim.getMonth() - dataInicio.getMonth())

  // IPCA-E aproximado (valores reais devem vir de API)
  const ipcaEMensal = 0.004 // 0.4% ao mês (exemplo)
  return Math.pow(1 + ipcaEMensal, meses) - 1
}

// Função principal de cálculo conforme EC 113/2021, Resolução 448/2022 CNJ e SONPREV
export function calcularCorrecaoMonetaria(
  formData: FormData,
  competencias: string[]
): Parcela[] {
  const parcelas: Parcela[] = [];
  const dataInicio = new Date(formData.dataInicioCalculo.split('/').reverse().join('-'));
  const dataFim = new Date(formData.dataTerminoCalculo.split('/').reverse().join('-'));

  // Obter cadeia de indexação
  const cadeiaIndexacao = getCadeiaIndexacao(dataInicio, dataFim);

  competencias.forEach(competencia => {
    const [ano, mes] = competencia.split('/').map(Number);
    const dataCompetencia = new Date(ano, mes - 1, 15); // Meio do mês

    // Calcular pro rata die
    const { diasTrabalhados, totalDiasMes, proRata } = calcularDiasTrabalhados(
      competencia,
      dataInicio,
      dataFim
    );

    // Valor nominal (RMI proporcional)
    const valorNominal = parseFloat(formData.rmi) * proRata;

    let valorCorrigido = valorNominal;
    let fatorAcumulado = 1;

    // Aplicar correção conforme cadeia de indexação
    cadeiaIndexacao.forEach(periodo => {
      if (dataCompetencia >= periodo.inicio && dataCompetencia <= periodo.fim) {
        if (periodo.indice === 'IPCA-E') {
          // IPCA-E até 11/2021
          const ipcaEAcumulado = getIpcaEAcumulado(periodo.inicio, dataCompetencia);
          fatorAcumulado *= (1 + ipcaEAcumulado);
        } else if (periodo.indice === 'SELIC') {
          // SELIC a partir de 12/2021: índice único (correção + juros), sem juros de mora extras
          const selicAcumulada = getTaxaSelicAcumulada(periodo.inicio, dataCompetencia);
          fatorAcumulado *= (1 + selicAcumulada);
        }
      }
    });

    valorCorrigido = valorNominal * fatorAcumulado;

    parcelas.push({
      competencia,
      valorNominal,
      valorCorrigido,
      diasTrabalhados,
      totalDiasMes,
      proRata
    });
  });

  return parcelas;
}

// Função para diagnóstico de divergências na SELIC
export function diagnosticarSelic(
  valorCalculado: number,
  valorReferencia: number
): { divergencia: number; diagnostico: string } {
  const divergencia = ((valorCalculado - valorReferencia) / valorReferencia) * 100

  let diagnostico = ''
  if (Math.abs(divergencia) < 0.1) {
    diagnostico = 'Valor compatível com SONPREV'
  } else if (divergencia > 0) {
    diagnostico = 'Valor superior ao SONPREV - possível incidência duplicada de juros'
  } else {
    diagnostico = 'Valor inferior ao SONPREV - verificar base de cálculo'
  }

  return { divergencia, diagnostico }
}
