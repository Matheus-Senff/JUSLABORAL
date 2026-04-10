import { Info } from 'lucide-react';

export function StepAvancado() {
  return (
    <div className="rounded-lg border border-border p-4 bg-accent/10 border-accent/20">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <div className="text-xs text-foreground space-y-1">
          <p className="font-semibold">Cadeia de Índices: Justiça Federal / SONPREV (EC 113/2021)</p>
          <p>Série composta pelos seguintes indexadores conforme período:</p>
          <ul className="list-disc list-inside ml-1 space-y-0.5">
            <li><strong>IGP-DI</strong> de 05/1996 a 08/2006 — Lei 9.711/98</li>
            <li><strong>INPC</strong> de 09/2006 a 11/2021 — Lei 8.213/91, STJ Tema 905</li>
            <li><strong>SELIC</strong> a partir de 12/2021 — EC 113/2021 (engloba correção + juros)</li>
          </ul>
          <p className="mt-2 font-semibold">Aplicação da SELIC (Res. 448/2022 CNJ, Art. 3º):</p>
          <ul className="list-disc list-inside ml-1 space-y-0.5">
            <li>Taxa SELIC aplicada de forma <strong>simples</strong> (não composta) sobre o valor principal</li>
            <li>Acumulada do mês posterior ao vencimento até o mês anterior ao pagamento</li>
            <li>Mais 1% no mês do pagamento (Manual de Cálculos da Justiça Federal)</li>
            <li>Não há incidência de juros de mora separados após 12/2021</li>
          </ul>
          <p className="mt-2 font-semibold">Regra de transição (anterior a 12/2021):</p>
          <ul className="list-disc list-inside ml-1 space-y-0.5">
            <li>Correção pelo índice definido (IGP-DI ou INPC) conforme período</li>
            <li>Juros de mora: 1% a.m. (até 06/2009) ou poupança (07/2009 a 11/2021)</li>
            <li>Parcelas vincendas (12 meses) incluídas automaticamente</li>
            <li>Sistemática de reajuste: <strong>Judiciário</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
