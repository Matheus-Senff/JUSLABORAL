import { ResultadoCalculo } from './calculoEngine';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number): string {
  return value.toFixed(4) + '%';
}

export function generateCalculoPDF(resultado: ResultadoCalculo): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Permita pop-ups para gerar o PDF');
    return;
  }

  const isPrecatorio = resultado.modoPrecatorio;

  const parcelasHTML = resultado.parcelas.map((p, i) => {
    const isVincenda = p.tipo === 'vincenda' || p.tipo === '13_vincenda';
    const rowClass = isVincenda ? 'vincenda' : i % 2 === 0 ? 'bg-gray' : '';

    if (isPrecatorio) {
      return `
      <tr class="${rowClass}">
        <td>${p.competencia}</td>
        <td class="right">${p.diasTrabalhados}/${p.diasNoMes}</td>
        <td class="right">${formatCurrency(p.valorDevido)}</td>
        <td class="right">${formatCurrency(p.diferenca)}</td>
        <td class="right">${p.ipcaPercent > 0 ? formatPercent(p.ipcaPercent) : '—'}</td>
        <td class="right">${p.ipcaValor > 0 ? formatCurrency(p.ipcaValor) : '—'}</td>
        <td class="right">${p.jurosMoratoriosPercent > 0 ? formatPercent(p.jurosMoratoriosPercent) : '—'}</td>
        <td class="right">${p.jurosMoratoriosValor > 0 ? formatCurrency(p.jurosMoratoriosValor) : '—'}</td>
        <td class="right bold">${formatCurrency(p.valorTotal)}</td>
      </tr>`;
    }

    return `
    <tr class="${rowClass}">
      <td>${p.competencia}</td>
      <td class="right">${p.diasTrabalhados}/${p.diasNoMes}</td>
      <td class="right">${formatCurrency(p.valorDevido)}</td>
      <td class="right">${formatCurrency(p.diferenca)}</td>
      <td class="right tag">${p.indiceAplicado}</td>
      <td class="right">${p.igpDiPercent > 0.001 ? formatPercent(p.igpDiPercent) : '—'}</td>
      <td class="right">${p.igpDiValor > 0.01 ? formatCurrency(p.igpDiValor) : '—'}</td>
      <td class="right">${p.inpcPercent > 0.001 ? formatPercent(p.inpcPercent) : '—'}</td>
      <td class="right">${p.inpcValor > 0.01 ? formatCurrency(p.inpcValor) : '—'}</td>
      <td class="right">${p.selicPercent > 0.001 ? formatPercent(p.selicPercent) : '—'}</td>
      <td class="right">${p.selicValor > 0.01 ? formatCurrency(p.selicValor) : '—'}</td>
      <td class="right">${p.jurosMoratoriosPercent > 0 ? formatPercent(p.jurosMoratoriosPercent) : '—'}</td>
      <td class="right">${p.jurosMoratoriosValor > 0.01 ? formatCurrency(p.jurosMoratoriosValor) : '—'}</td>
      <td class="right bold">${formatCurrency(p.valorTotal)}</td>
    </tr>`;
  }).join('');

  const vincendasSection = resultado.incluiu12Vincendas ? `
    <div class="info-item"><span class="info-label">12 Vincendas:</span><span class="info-value">Sim (${formatCurrency(resultado.totalVincendas)})</span></div>
    <div class="info-item"><span class="info-label">13° nas Vincendas:</span><span class="info-value">${resultado.incluiu13Vincendas ? 'Sim' : 'Não'}</span></div>
  ` : '';

  const limiteSection = resultado.limitou60SM ? `
    <div class="limit-note">
      <strong>⚠ Limite JEF aplicado:</strong> Valor da causa limitado a 60 salários mínimos (${formatCurrency(resultado.teto60SM)}).
    </div>
  ` : '';

  const tableHeaders = isPrecatorio
    ? `<tr>
        <th>Competência</th><th class="right">Dias</th>
        <th class="right">Vlr. Devido</th><th class="right">Diferença</th>
        <th class="right">IPCA %</th><th class="right">IPCA R$</th>
        <th class="right">Juros 2% a.a. %</th><th class="right">Juros R$</th>
        <th class="right">Total</th>
      </tr>`
    : `<tr>
        <th>Competência</th><th class="right">Dias</th>
        <th class="right">Vlr. Devido</th><th class="right">Diferença</th>
        <th>Índice</th>
        <th class="right">IGP-DI %</th><th class="right">IGP-DI R$</th>
        <th class="right">INPC %</th><th class="right">INPC R$</th>
        <th class="right">SELIC %</th><th class="right">SELIC R$</th>
        <th class="right">Juros Mora %</th><th class="right">Juros Mora R$</th>
        <th class="right">Total</th>
      </tr>`;

  const totalsRow = isPrecatorio
    ? `<tr class="totals">
        <td colspan="3"><strong>TOTAIS VENCIDAS</strong></td>
        <td class="right">${formatCurrency(resultado.totalDiferenca)}</td>
        <td></td>
        <td class="right">${formatCurrency(resultado.parcelas.filter(p => p.tipo === 'mensal' || p.tipo === '13_salario').reduce((s, p) => s + p.ipcaValor, 0))}</td>
        <td></td>
        <td class="right">${formatCurrency(resultado.totalJurosMoratorios)}</td>
        <td class="right">${formatCurrency(resultado.totalCorrigido + resultado.totalJurosMoratorios)}</td>
      </tr>`
    : `<tr class="totals">
        <td colspan="3"><strong>TOTAIS VENCIDAS</strong></td>
        <td class="right">${formatCurrency(resultado.totalDiferenca)}</td>
        <td></td>
        <td></td><td class="right">${formatCurrency(resultado.totalJurosIgpDi)}</td>
        <td></td><td class="right">${formatCurrency(resultado.totalJurosInpc)}</td>
        <td></td><td class="right">${formatCurrency(resultado.totalJurosSelic)}</td>
        <td></td><td class="right">${formatCurrency(resultado.totalJurosMoratorios)}</td>
        <td class="right">${formatCurrency(resultado.totalCorrigido + resultado.totalJurosMoratorios)}</td>
      </tr>`;

  const legalNote = isPrecatorio
    ? `<strong>📋 Fundamentação Legal — EC 136/2025 (Precatórios)</strong>
      Cálculos elaborados conforme Emenda Constitucional 136/2025 para expedição de requisitórios:
      (i) Correção monetária pelo IPCA (Índice Nacional de Preços ao Consumidor Amplo);
      (ii) Juros de mora: 2% ao ano, conforme EC 136/2025;
      (iii) Reajustes anuais conforme índices oficiais (${resultado.sistematicaReajuste}).`
    : `<strong>📋 Fundamentação Legal — Res. CJF 963/2025 (SONPREV)</strong>
      Cálculos elaborados conforme Manual de Cálculos da Justiça Federal (CJF), observando cadeia de índices:
      (i) <strong>IGP-DI</strong> (FGV): 05/1996 a 08/2006 — Lei 9.711/98;
      (ii) <strong>INPC</strong> (IBGE): 09/2006 a 11/2021 — Lei 8.213/91, STJ Tema 905 (REsp 1.495.146);
      (iii) <strong>SELIC</strong> (BCB): a partir de 12/2021 — EC 113/2021, art. 3° (engloba correção + juros);
      (iv) Juros moratórios: até 06/2009: 1% a.m. (CC art. 406); 07/2009 a 11/2021: poupança (Lei 11.960/09);
      (v) Cálculo pro-rata por dias efetivos (salário ÷ 30 × dias);
      (vi) Reajustes: ${resultado.sistematicaReajuste}.`;

  const correctionNote = isPrecatorio
    ? `<strong>Atualização Monetária:</strong> IPCA (EC 136/2025)<br>
       <strong>Juros:</strong> 2% ao ano (EC 136/2025)`
    : `<strong>Cadeia de Correção Monetária (Res. CJF 963/2025):</strong><br>
       • 05/1996 a 08/2006: <strong>IGP-DI</strong> (Lei 9.711/98)<br>
       • 09/2006 a 11/2021: <strong>INPC</strong> (Lei 8.213/91, STJ Tema 905)<br>
       • A partir de 12/2021: <strong>SELIC</strong> (EC 113/2021 — correção + juros)<br>
       <strong>Juros Moratórios:</strong> Até 06/2009: 1% a.m. • 07/2009 a 11/2021: Poupança (Lei 11.960/09) • Pós 12/2021: incluso na SELIC`;

  const summaryBoxes = isPrecatorio
    ? `<div class="summary-box"><div class="lbl">Diferença Bruta</div><div class="val">${formatCurrency(resultado.totalDiferenca)}</div></div>
       <div class="summary-box highlight"><div class="lbl">Correção IPCA</div><div class="val">${formatCurrency(resultado.parcelas.filter(p => p.tipo === 'mensal' || p.tipo === '13_salario').reduce((s, p) => s + p.ipcaValor, 0))}</div></div>
       <div class="summary-box"><div class="lbl">Juros 2% a.a.</div><div class="val">${formatCurrency(resultado.totalJurosMoratorios)}</div></div>
       <div class="summary-box"><div class="lbl">Vincendas${resultado.incluiu13Vincendas ? ' + 13°' : ''}</div><div class="val">${formatCurrency(resultado.totalVincendas)}</div></div>`
    : `<div class="summary-box"><div class="lbl">Diferença Bruta</div><div class="val">${formatCurrency(resultado.totalDiferenca)}</div></div>
       <div class="summary-box"><div class="lbl">Correção IGP-DI</div><div class="val">${formatCurrency(resultado.totalJurosIgpDi)}</div></div>
       <div class="summary-box"><div class="lbl">Correção INPC</div><div class="val">${formatCurrency(resultado.totalJurosInpc)}</div></div>
       <div class="summary-box highlight"><div class="lbl">SELIC (Correção+Juros)</div><div class="val">${formatCurrency(resultado.totalJurosSelic)}</div></div>
       <div class="summary-box"><div class="lbl">Juros Moratórios</div><div class="val">${formatCurrency(resultado.totalJurosMoratorios)}</div></div>
       <div class="summary-box"><div class="lbl">Vincendas${resultado.incluiu13Vincendas ? ' + 13°' : ''}</div><div class="val">${formatCurrency(resultado.totalVincendas)}</div></div>`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Memória de Cálculo - ${resultado.autor}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; color: #1a1a2e; line-height: 1.4; padding: 15px; }
    .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 10px; margin-bottom: 12px; }
    .header h1 { font-size: 15px; color: #1a365d; margin-bottom: 2px; }
    .header h2 { font-size: 11px; color: #4a5568; font-weight: 500; }
    .header p { font-size: 9px; color: #666; margin-top: 4px; }
    .section { margin-bottom: 12px; }
    .section-title { font-size: 10px; font-weight: 700; color: #1a365d; border-bottom: 1px solid #cbd5e0; padding-bottom: 3px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 16px; }
    .info-item { display: flex; gap: 4px; }
    .info-label { font-weight: 600; color: #4a5568; min-width: 130px; }
    .info-value { color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; font-size: 6.5px; margin-top: 4px; }
    th { background: #1a365d; color: white; padding: 3px 3px; text-align: left; font-weight: 600; font-size: 6px; text-transform: uppercase; letter-spacing: 0.2px; }
    td { padding: 2px 3px; border-bottom: 1px solid #e2e8f0; }
    .right { text-align: right; }
    .bold { font-weight: 600; }
    .tag { font-size: 5.5px; font-weight: 700; color: #2c5282; text-align: center; }
    .bg-gray { background: #f7fafc; }
    .vincenda { background: #fffff0; }
    .totals { background: #edf2f7; }
    .totals td { font-weight: 700; font-size: 7px; border-top: 2px solid #1a365d; }
    .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #cbd5e0; font-size: 7.5px; color: #718096; }
    .footer p { margin-bottom: 2px; }
    .correction-note { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 4px; padding: 6px 8px; margin-bottom: 10px; font-size: 7.5px; color: #2c5282; line-height: 1.5; }
    .limit-note { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px; padding: 6px 8px; margin-bottom: 10px; font-size: 8px; color: #92400e; }
    .grand-total { background: #1a365d; color: white; padding: 10px; border-radius: 4px; text-align: center; margin-top: 12px; }
    .grand-total .amount { font-size: 16px; font-weight: 700; }
    .grand-total .label { font-size: 9px; opacity: 0.8; }
    .summary-grid { display: grid; grid-template-columns: repeat(${isPrecatorio ? 4 : 6}, 1fr); gap: 6px; margin-top: 10px; }
    .summary-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px; text-align: center; }
    .summary-box .val { font-size: 10px; font-weight: 700; color: #1a365d; }
    .summary-box .lbl { font-size: 6.5px; color: #718096; text-transform: uppercase; }
    .summary-box.highlight { background: #ebf8ff; border-color: #90cdf4; }
    .legal-note { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 4px; padding: 8px; margin-top: 10px; font-size: 7px; color: #276749; line-height: 1.6; }
    .legal-note strong { display: block; margin-bottom: 2px; font-size: 8px; }
    @media print {
      body { padding: 8px; }
      @page { size: A4 landscape; margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MEMÓRIA DE CÁLCULO PREVIDENCIÁRIO</h1>
    <h2>${resultado.modo}</h2>
    <p>Elaborado em ${resultado.dataCalculo} — Metodologia conforme ${isPrecatorio ? 'EC 136/2025' : 'Manual de Cálculos da Justiça Federal (CJF) / Res. CJF 963/2025'}</p>
  </div>

  <div class="section">
    <div class="section-title">Dados do Cálculo</div>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Autor:</span><span class="info-value">${resultado.autor}</span></div>
      <div class="info-item"><span class="info-label">Espécie:</span><span class="info-value">${resultado.especie}</span></div>
      <div class="info-item"><span class="info-label">RMI:</span><span class="info-value">${formatCurrency(resultado.rmi)}</span></div>
      <div class="info-item"><span class="info-label">DIB:</span><span class="info-value">${resultado.dib}</span></div>
      <div class="info-item"><span class="info-label">DIP:</span><span class="info-value">${resultado.dip}</span></div>
      <div class="info-item"><span class="info-label">Período:</span><span class="info-value">${resultado.periodoInicio} a ${resultado.periodoFim}</span></div>
      <div class="info-item"><span class="info-label">Sist. Reajuste:</span><span class="info-value">${resultado.sistematicaReajuste}</span></div>
      ${vincendasSection}
    </div>
  </div>

  <div class="correction-note">
    ${correctionNote}
  </div>

  ${limiteSection}

  <div class="section">
    <div class="section-title">Memória de Cálculo Detalhada</div>
    <table>
      <thead>${tableHeaders}</thead>
      <tbody>
        ${parcelasHTML}
        ${totalsRow}
      </tbody>
    </table>
  </div>

  <div class="summary-grid">
    ${summaryBoxes}
  </div>

  <div class="grand-total">
    <div class="label">${resultado.limitou60SM ? 'VALOR DA CAUSA (LIMITADO A 60 SM — JEF)' : 'VALOR TOTAL DA CAUSA'}</div>
    <div class="amount">${formatCurrency(resultado.valorCausa)}</div>
  </div>

  <div class="legal-note">
    ${legalNote}
    <br>Os valores estão sujeitos à conferência e homologação judicial.
  </div>

  <div class="footer">
    <p><strong>CalcPrev — Sistema de Cálculos Previdenciários</strong></p>
    <p>Metodologia: ${isPrecatorio ? 'IPCA (IBGE) • EC 136/2025 • Juros 2% a.a.' : 'IGP-DI (FGV) • INPC (IBGE) • SELIC (BCB) • Lei 9.711/98 • Lei 8.213/91 • STJ Tema 905 • EC 113/2021 • Lei 11.960/09 • Res. CJF 963/2025'}</p>
    <p>Documento gerado automaticamente. Os valores apurados são de responsabilidade do elaborador e estão sujeitos à conferência judicial.</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
