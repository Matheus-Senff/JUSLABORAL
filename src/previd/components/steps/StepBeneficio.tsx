import { useCalculo } from '@previd/contexts/CalculoContext';
import { MaskedInput } from '@previd/components/MaskedInput';
import { maskCurrency } from '@previd/lib/masks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@previd/components/ui/select';
import { Switch } from '@previd/components/ui/switch';
import { Label } from '@previd/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@previd/components/ui/tooltip';
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
  const { formData, updateFormData } = useCalculo();
  const showGrauIncapacidade = formData.especie === 'Aposentadoria por Incapacidade';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
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
        label="RMI (Renda Mensal Inicial)"
        value={formData.rmi}
        onChange={(v) => updateFormData({ rmi: v })}
        mask={maskCurrency}
        placeholder="R$ 0,00"
        tooltip={formData.fixarSalarioMinimo ? 'Opcional quando fixado em Salário Mínimo' : 'Valor inicial do benefício na data do seu início'}
        required={!formData.fixarSalarioMinimo}
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
