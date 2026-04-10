import { useCalculo } from '../contexts/CalculoContext';


export function ResultadosCalculo() {
  const { executarCalculo, formData } = useCalculo();

  // Validação mínima dos campos essenciais
  const camposObrigatorios = [formData?.dataInicioCalculo, formData?.dataTerminoCalculo, formData?.rmi];
  const algumVazio = camposObrigatorios.some((v) => !v || v.trim() === '' || v === '0');
  // Mensagem removida conforme solicitado

  const { parcelas, total, diagnostico } = executarCalculo();

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="space-y-6 calculo-section">
      {/* Resumo do Cálculo */}
      <div className="calculo-card">
        <h3 className="text-lg font-semibold calculo-text-primary mb-4">
          Resultado do Cálculo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm calculo-text-secondary font-medium">Total Parcelas</div>
            <div className="text-2xl font-bold calculo-text-primary">
              {parcelas.length}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm calculo-text-secondary font-medium">Valor Total</div>
            <div className="text-2xl font-bold calculo-text-primary">
              {formatarMoeda(total)}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-sm calculo-text-secondary font-medium">Status SELIC</div>
            <div className="text-sm font-bold calculo-text-primary">
              {diagnostico}
            </div>
          </div>
        </div>

        {/* Diagnóstico Detalhado */}
        <div className="bg-gray-50 dark:bg-calculo-card p-4 rounded-lg border border-gray-200 dark:border-calculo-border">
          <h4 className="text-sm font-medium calculo-text-primary mb-2">
            Diagnóstico de Conformidade
          </h4>
          <p className="text-sm calculo-text-secondary">
            {diagnostico}
          </p>
        </div>
      </div>

      {/* Tabela de Parcelas */}
      <div className="calculo-card overflow-hidden">
        <div className="px-6 py-4 border-b border-calculo-border">
          <h3 className="text-lg font-semibold calculo-text-primary">
            Detalhamento das Parcelas
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="calculo-table">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium calculo-text-secondary uppercase tracking-wider">
                  Competência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium calculo-text-secondary uppercase tracking-wider">
                  Valor Nominal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium calculo-text-secondary uppercase tracking-wider">
                  Dias Trabalhados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium calculo-text-secondary uppercase tracking-wider">
                  Pro-rata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium calculo-text-secondary uppercase tracking-wider">
                  Valor Corrigido
                </th>
              </tr>
            </thead>
            <tbody>
              {parcelas.map((parcela, index) => (
                <tr key={index} className="calculo-interactive">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium calculo-text-primary">
                    {parcela.competencia}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm calculo-text-primary">
                    {formatarMoeda(parcela.valorNominal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm calculo-text-primary">
                    {parcela.diasTrabalhados}/{parcela.totalDiasMes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm calculo-text-primary">
                    {(parcela.proRata * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                    {formatarMoeda(parcela.valorCorrigido)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm font-medium calculo-text-primary text-right">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                  {formatarMoeda(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Informações de Conformidade */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium calculo-text-primary mb-2">
          Conformidade com Normas
        </h4>
        <ul className="text-sm calculo-text-secondary space-y-1">
          <li>• EC 113/2021 - Justiça Federal</li>
          <li>• CNJ Resolução 448/2022 (Art. 3º — Taxa SELIC como índice único)</li>
          <li>• Cadeia de Indexação: IGP-DI (até 08/2006) → INPC (09/2006 a 11/2021) → SELIC (a partir de 12/2021)</li>
          <li>• SELIC aplicada de forma simples, acumulada do mês posterior ao vencimento até o mês anterior ao pagamento, mais 1% no mês do pagamento</li>
          <li>• Cálculo pro-rata para dias trabalhados</li>
        </ul>
      </div>

      {/* Nota de Rodapé Automática */}
      <div className="text-[11px] calculo-text-secondary italic text-center pt-2 border-t border-gray-200 dark:border-calculo-border">
        Cálculo atualizado conforme EC 113/2021 e Resolução 448/2022 do CNJ (Taxa SELIC).
      </div>
    </div>
  );
}