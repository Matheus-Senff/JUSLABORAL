import { useCalculo } from '@/contexts/CalculoContext';
import { MaskedInput } from '@/components/MaskedInput';
import { maskDate, maskCurrency } from '@/lib/masks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

const especies = [
  'Aposentadoria por Idade',
  'Aposentadoria por Tempo de Contribuição',
  'Aposentadoria por Incapacidade',
  'Aposentadoria Especial',
  'Auxílio-Doença',
  'Auxílio-Acidente',
  'Pensão por Morte',
  'Salário-Maternidade',
  'BPC/LOAS',
];

export function StepBeneficio() {
  const { formData, updateFormData, calculoMode } = useCalculo();
  const isInicial = calculoMode === 'inicial';
  const showGrauIncapacidade = formData.especie === 'Aposentadoria por Incapacidade';
  const rmiRequired = isInicial ? !formData.fixarSalarioMinimo : true;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Label className="text-sm font-medium">Espécie de Benefício <span className="text-destructive">*</span></Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs">
              Tipo de benefício previdenciário conforme legislação do INSS
            </TooltipContent>
          </Tooltip>
        </div>
        <Select value={formData.especie} onValueChange={(v) => updateFormData({ especie: v })}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Selecione a espécie" />
          </SelectTrigger>
          <SelectContent>
            {especies.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <MaskedInput
        label="NB (Número do Benefício)"
        value={formData.nb}
        onChange={(v) => updateFormData({ nb: v })}
        placeholder="000.000.000-0"
        tooltip="Número do Benefício atribuído pelo INSS"
        required={!isInicial}
      />
      <MaskedInput
        label="DIB (Data de Início do Benefício)"
        value={formData.dib}
        onChange={(v) => updateFormData({ dib: v })}
        mask={maskDate}
        placeholder="DD/MM/AAAA"
        tooltip="Data a partir da qual o benefício passa a ser devido"
        required={!isInicial}
      />
      <MaskedInput
        label="DIP (Data de Início do Pagamento)"
        value={formData.dip}
        onChange={(v) => updateFormData({ dip: v })}
        mask={maskDate}
        placeholder="DD/MM/AAAA"
        tooltip="Data em que o INSS efetivamente iniciou o pagamento do benefício"
      />
      <MaskedInput
        label="RMI (Renda Mensal Inicial)"
        value={formData.rmi}
        onChange={(v) => updateFormData({ rmi: v })}
        mask={maskCurrency}
        placeholder="R$ 0,00"
        tooltip={isInicial && formData.fixarSalarioMinimo ? "Opcional quando fixado em Salário Mínimo" : "Valor inicial do benefício na data do seu início (DIB)"}
        required={rmiRequired}
      />
      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Fixar em Salário Mínimo</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs">
              Se ativado, o valor do benefício será calculado com base no salário mínimo vigente em cada competência
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          checked={formData.fixarSalarioMinimo}
          onCheckedChange={(v) => updateFormData({ fixarSalarioMinimo: v })}
        />
      </div>
      {showGrauIncapacidade && (
        <MaskedInput
          label="Grau de Incapacidade"
          value={formData.grauIncapacidade}
          onChange={(v) => updateFormData({ grauIncapacidade: v })}
          placeholder="Ex: Total e permanente"
          tooltip="Grau de incapacidade laborativa conforme laudo médico pericial"
          required
        />
      )}
    </div>
  );
}
