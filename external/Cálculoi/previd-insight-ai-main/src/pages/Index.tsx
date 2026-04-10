import { CalculoProvider, useCalculo } from '@/contexts/CalculoContext';
import { Stepper } from '@/components/Stepper';
import { ModeBadge } from '@/components/ModeBadge';
import { AIAnalyzeButton } from '@/components/AIAnalyzeButton';
import { StepModoCalculo } from '@/components/steps/StepModoCalculo';
import { StepIdentificacao } from '@/components/steps/StepIdentificacao';
import { StepProcesso } from '@/components/steps/StepProcesso';
import { StepParametros } from '@/components/steps/StepParametros';
import { StepBeneficio } from '@/components/steps/StepBeneficio';
import { StepAvancado } from '@/components/steps/StepAvancado';
import { StepDependentes } from '@/components/steps/StepDependentes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const stepTitles = [
  'Identificação do Autor',
  'Dados do Processo',
  'Parâmetros de Cálculo',
  'Dados do Benefício',
  'Configurações Avançadas',
  'Resultado',
];

const stepTitlesExecucao = [
  'Identificação do Autor',
  'Dados do Processo',
  'Parâmetros de Cálculo',
  'Dados do Benefício',
  'Configurações Avançadas',
  'Dependentes',
];

const stepDescriptions = [
  'Informe os dados pessoais do autor da ação previdenciária.',
  'Preencha as informações sobre o processo judicial.',
  'Defina os parâmetros temporais e monetários do cálculo.',
  'Configure o tipo e valores do benefício previdenciário.',
  'Ajuste configurações adicionais como teto e adicional de 25%.',
  'Cadastre os dependentes habilitados ao benefício.',
];

const stepDescriptionsInicial = [
  'Informe os dados pessoais do autor da ação previdenciária.',
  'Preencha as informações sobre o processo judicial.',
  'Defina os parâmetros temporais, 13° salário e sistemática de reajuste.',
  'Configure o tipo e valores do benefício previdenciário.',
  'Configure a correção monetária (IPCA-E / SELIC).',
  'Execute o cálculo e gere o relatório em PDF.',
];

function CalculoContent() {
  const { currentStep, setCurrentStep, markStepComplete, formData, calculoMode } = useCalculo();
  const isPreStep = currentStep === -1;
  const isInicial = calculoMode === 'inicial';

  const titles = isInicial ? stepTitles : stepTitlesExecucao;
  const descriptions = isInicial ? stepDescriptionsInicial : stepDescriptions;

  const stepComponents = [
    <StepIdentificacao />,
    <StepProcesso />,
    <StepParametros />,
    <StepBeneficio />,
    <StepAvancado />,
    <StepDependentes />,
  ];

  const goNext = () => {
    if (isPreStep) {
      if (!calculoMode) {
        toast({ title: 'Selecione uma modalidade', description: 'Escolha entre Cálculo Inicial ou Cálculo de Execução para continuar.' });
        return;
      }
      setCurrentStep(0);
      return;
    }
    markStepComplete(currentStep);
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    else {
      toast({
        title: 'Cálculo pronto para processamento',
        description: 'Todos os dados foram preenchidos. O JSON estruturado está disponível no console.',
      });
      console.log('[RESULTADO] Dados completos:', JSON.stringify({ modo: calculoMode, ...formData }, null, 2));
    }
  };

  const goBack = () => {
    if (currentStep > -1) setCurrentStep(currentStep - 1);
  };

  // Hide next/finish button on last step for inicial mode (has its own button)
  const showNextButton = !(isInicial && currentStep === 5);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">CalcPrev</h1>
              <p className="text-xs text-muted-foreground">Cálculos Previdenciários</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeBadge />
            {!isPreStep && <AIAnalyzeButton stepName={titles[currentStep]} />}
          </div>
        </div>
      </header>

      {!isPreStep && (
        <div className="border-b border-border bg-card py-5">
          <Stepper />
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Card className="p-6 bg-card border-border shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">
                    {isPreStep ? 'Início' : `Etapa ${currentStep + 1} de 6`}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isPreStep ? 'Modalidade de Cálculo' : titles[currentStep]}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isPreStep
                    ? 'Selecione o tipo de cálculo previdenciário que deseja realizar.'
                    : descriptions[currentStep]}
                </p>
              </div>

              {isPreStep ? <StepModoCalculo /> : stepComponents[currentStep]}

              <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={isPreStep}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
                {showNextButton && (
                  <Button onClick={goNext} className="gap-1.5">
                    {isPreStep ? 'Começar' : currentStep === 5 ? 'Finalizar' : 'Próxima Etapa'}
                    {currentStep < 5 && <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <CalculoProvider>
      <CalculoContent />
    </CalculoProvider>
  );
}
