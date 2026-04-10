import { CalculoProvider, useCalculo } from '@previd/contexts/CalculoContext';
import { StepModoCalculo } from '@previd/components/steps/StepModoCalculo';
import { StepIdentificacao } from '@previd/components/steps/StepIdentificacao';
import { StepProcesso } from '@previd/components/steps/StepProcesso';
import { StepParametros } from '@previd/components/steps/StepParametros';
import { StepBeneficio } from '@previd/components/steps/StepBeneficio';
import { StepAvancado } from '@previd/components/steps/StepAvancado';
import { ResultadosCalculo } from '@previd/components/ResultadosCalculo';
import { Button } from '@previd/components/ui/button';
import { Card } from '@previd/components/ui/card';
import { Scale, FilePlus, Gavel } from 'lucide-react';
import { toast } from '@previd/hooks/use-toast';
import { useState } from 'react';
import jsPDF from 'jspdf';

function CalculoForm() {
  const { calculoMode, setCalculoMode, formData, resetFormData, executarCalculo } = useCalculo();
  const [step, setStep] = useState<1 | 2>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Etapa 1: Seleção inicial
  if (step === 1) {
    return (
      <div className="min-h-screen bg-calculo-bg flex flex-col">
        <header className="border-b border-calculo-border bg-calculo-card sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold calculo-text-primary leading-tight">Cálculo Previdenciário</h1>
              <p className="text-xs calculo-text-secondary">Sistema de Cálculos Previdenciários</p>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-3xl flex flex-col gap-8 items-center">
            <div className="grid grid-cols-2 gap-8 w-full">
              <button
                onClick={() => setCalculoMode('inicial')}
                className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 transition-colors duration-200 cursor-pointer bg-card shadow-lg ${calculoMode === 'inicial' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                style={{ width: '100%', height: '280px', padding: '2rem 1.5rem' }}
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${calculoMode === 'inicial' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-zinc-700'}`}>
                  <FilePlus className="h-10 w-10" />
                </div>
                <span className="text-xl font-bold text-primary leading-tight">Cálculo Inicial</span>
                <span className="text-sm text-muted-foreground leading-snug text-center max-w-[180px]">Para concessão, revisões e projeções de benefícios.</span>
              </button>
              <button
                onClick={() => setCalculoMode('execucao')}
                className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 transition-colors duration-200 cursor-pointer bg-card shadow-lg ${calculoMode === 'execucao' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                style={{ width: '100%', height: '280px', padding: '2rem 1.5rem' }}
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${calculoMode === 'execucao' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-zinc-700'}`}>
                  <Gavel className="h-10 w-10" />
                </div>
                <span className="text-xl font-bold text-primary leading-tight">Cálculo de Execução</span>
                <span className="text-sm text-muted-foreground leading-snug text-center max-w-[180px]">Para apuração de atrasados após sentença judicial.</span>
              </button>
            </div>
            <Button
              size="lg"
              className="calculo-button shadow-lg bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl mt-4"
              disabled={!calculoMode}
              onClick={() => setStep(2)}
            >
              Novo Cálculo
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Etapa 2: Formulário lazy-load
  // Função para gerar PDF e abrir em nova aba

  async function handleGerarCalculoPDF() {
    // Validar campos obrigatórios antes de gerar o PDF
    if (!formData.dataInicioCalculo || !formData.dataTerminoCalculo || !formData.rmi) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha Data Início, Data Término e RMI antes de gerar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    const fmt = (v: number) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let resultado: ReturnType<typeof executarCalculo>;
    try {
      resultado = executarCalculo();
    } catch (e: any) {
      toast({ title: 'Erro no cálculo', description: e.message, variant: 'destructive' });
      return;
    }

    const { parcelas, total, diagnostico } = resultado;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const margin = 14;
    let y = 20;

    const addLine = (text: string, size = 10, bold = false) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(text, margin, y);
      y += size * 0.45 + 2;
    };

    const checkPage = (needed = 8) => {
      if (y + needed > 285) {
        doc.addPage();
        y = 18;
      }
    };

    // ── Cabeçalho ──
    doc.setFillColor(30, 80, 160);
    doc.rect(0, 0, W, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Cálculo Previdenciário', margin, 9.5);
    doc.setTextColor(0, 0, 0);
    y = 22;

    // ── Identificação ──
    addLine('IDENTIFICAÇÃO', 10, true);
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, W - margin, y);
    y += 3;
    addLine(`Modalidade: ${calculoMode === 'inicial' ? 'Cálculo Inicial (Concessão)' : 'Cálculo de Execução (Cumprimento de Sentença)'}`);
    if (formData.autor) addLine(`Autor: ${formData.autor}`);
    if (formData.cpf) addLine(`CPF: ${formData.cpf}`);
    if (formData.nascimento) addLine(`Nascimento: ${formData.nascimento}`);
    if (formData.nup) addLine(`NUP: ${formData.nup}`);
    if (formData.especie) addLine(`Espécie: ${formData.especie}`);
    if (formData.nb) addLine(`NB: ${formData.nb}`);
    if (formData.dib) addLine(`DIB: ${formData.dib}`);
    y += 3;

    // ── Parâmetros ──
    addLine('PARÂMETROS DO CÁLCULO', 10, true);
    doc.line(margin, y, W - margin, y);
    y += 3;
    addLine(`RMI: ${fmt(parseFloat(formData.rmi.replace(/[^\d,]/g, '').replace(',', '.')) || 0)}`);
    addLine(`Período: ${formData.dataInicioCalculo} a ${formData.dataTerminoCalculo}`);
    addLine(`Sistemática: Judiciário — EC 113/2021 / Res. 448/2022 CNJ`);
    addLine(`Cadeia: IGP-DI (até 08/2006) → INPC (09/2006 a 11/2021) → SELIC (a partir de 12/2021)`);
    y += 3;

    // ── Resumo ──
    addLine('RESUMO', 10, true);
    doc.line(margin, y, W - margin, y);
    y += 3;
    addLine(`Total de parcelas: ${parcelas.length}`);
    addLine(`Valor total corrigido: ${fmt(total)}`, 10, false);
    addLine(`Diagnóstico: ${diagnostico}`);
    y += 5;

    // ── Tabela de parcelas ──
    checkPage(12);
    addLine('DETALHAMENTO DAS PARCELAS', 10, true);
    doc.line(margin, y, W - margin, y);
    y += 4;

    // Cabeçalho da tabela
    const cols = [margin, 40, 75, 110, 145, 175];
    doc.setFillColor(230, 236, 248);
    doc.rect(margin, y - 3, W - margin * 2, 7, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Competência', cols[0], y + 1);
    doc.text('Val. Nominal', cols[1], y + 1);
    doc.text('Dias', cols[2], y + 1);
    doc.text('Pro-rata', cols[3], y + 1);
    doc.text('Val. Corrigido', cols[4], y + 1);
    y += 6;
    doc.setFont('helvetica', 'normal');

    parcelas.forEach((p, i) => {
      checkPage(6);
      if (i % 2 === 0) {
        doc.setFillColor(246, 248, 252);
        doc.rect(margin, y - 3, W - margin * 2, 6, 'F');
      }
      doc.setFontSize(7.5);
      doc.text(p.competencia, cols[0], y);
      doc.text(fmt(p.valorNominal), cols[1], y);
      doc.text(`${p.diasTrabalhados}/${p.totalDiasMes}`, cols[2], y);
      doc.text(`${(p.proRata * 100).toFixed(1)}%`, cols[3], y);
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(p.valorCorrigido), cols[4], y);
      doc.setFont('helvetica', 'normal');
      y += 5.5;
    });

    // Linha de total
    checkPage(8);
    doc.setDrawColor(30, 80, 160);
    doc.line(margin, y, W - margin, y);
    y += 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GERAL', cols[0], y);
    doc.text(fmt(total), cols[4], y);
    y += 6;

    // ── Nota de rodapé ──
    checkPage(12);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Cálculo gerado em ${new Date().toLocaleString('pt-BR')} — EC 113/2021 e Resolução 448/2022 do CNJ (Taxa SELIC).`,
      margin,
      y,
    );

    // Gerar blob e abrir
    const blob = doc.output('blob');
    const pdfBlobObj = new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlobObj);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(url);
    setPdfBlob(pdfBlobObj);
    setShowPdfOptions(true);
    window.open(url, '_blank');

    toast({ title: 'PDF gerado!', description: `${parcelas.length} parcelas — Total: ${fmt(total)}` });
  }

  async function handleDownloadPDF() {
    if (!pdfBlob) return;
    const a = document.createElement('a');
    a.href = pdfUrl!;
    a.download = 'calculo-previdenciario.pdf';
    a.click();
  }

  async function handleUploadGoogleDrive() {
    // Aqui você integraria com a API do Google Drive já autenticada
    // Exemplo: enviar pdfBlob para o backend ou direto para a API
    toast({ title: 'Upload para Google Drive', description: 'Integração real deve ser implementada.' });
  }

  return (
    <div className="min-h-screen bg-calculo-bg">
      <header className="border-b border-calculo-border bg-calculo-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold calculo-text-primary leading-tight">Cálculo Previdenciário</h1>
            <p className="text-xs calculo-text-secondary">Sistema de Cálculos Previdenciários</p>
          </div>
          <div className="ml-auto">
            <div className="bg-zinc-100 border-2 border-zinc-300 rounded-2xl px-6 py-2 flex items-center shadow-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStep(1); resetFormData(); setCalculoMode(null); }}
                className="font-bold text-zinc-800 hover:bg-zinc-200 hover:text-zinc-900 focus:bg-zinc-200 focus:text-zinc-900"
                style={{ transition: 'background 0.2s, color 0.2s' }}
              >
                Novo Cálculo
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <Card className="p-5 bg-calculo-card border-calculo-border shadow-sm calculo-interactive">
            <h2 className="text-sm font-semibold mb-3 calculo-text-primary uppercase tracking-wide">Identificação</h2>
            <StepIdentificacao />
          </Card>
          <Card className="p-5 bg-calculo-card border-calculo-border shadow-sm calculo-interactive">
            <h2 className="text-sm font-semibold mb-3 calculo-text-primary uppercase tracking-wide">Dados do Processo</h2>
            <StepProcesso />
          </Card>
          <Card className="p-5 bg-calculo-card border-calculo-border shadow-sm calculo-interactive">
            <h2 className="text-sm font-semibold mb-3 calculo-text-primary uppercase tracking-wide">Períodos e Parâmetros</h2>
            <StepParametros />
          </Card>
          <Card className="p-5 bg-calculo-card border-calculo-border shadow-sm calculo-interactive">
            <h2 className="text-sm font-semibold mb-3 calculo-text-primary uppercase tracking-wide">Dados do Benefício</h2>
            <StepBeneficio />
          </Card>
          <Card className="p-5 bg-calculo-card border-calculo-border shadow-sm calculo-interactive">
            <h2 className="text-sm font-semibold mb-3 calculo-text-primary uppercase tracking-wide">Correção Monetária</h2>
            <StepAvancado />
          </Card>

        </div>
        <div className="sticky bottom-0 left-0 w-full flex flex-col items-end mt-8 z-20 pointer-events-none">
          <div className="pointer-events-auto w-full flex justify-end pb-4 pr-2">
            <Button
              size="lg"
              className="calculo-button shadow-lg bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl"
              onClick={handleGerarCalculoPDF}
            >
              Gerar Cálculo
            </Button>
          </div>
          {showPdfOptions && pdfUrl && (
            <div className="pointer-events-auto w-full flex gap-3 justify-end pb-2 pr-2 mt-2">
              <Button variant="outline" onClick={handleDownloadPDF}>Salvar no PC</Button>
              <Button variant="outline" onClick={handleUploadGoogleDrive}>Enviar para Google Drive</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <CalculoProvider>
      <CalculoForm />
    </CalculoProvider>
  );
}
