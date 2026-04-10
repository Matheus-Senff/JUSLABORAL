import { useCalculo } from '@/contexts/CalculoContext';
import { MaskedInput } from '@/components/MaskedInput';
import { maskDate } from '@/lib/masks';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useEffect } from 'react';

function ToggleRow({
  id, label, checked, onCheckedChange, tooltip,
}: {
  id: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void; tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-success" />
    </div>
  );
}

function SistematicaToggle({
  value, onChange,
}: {
  value: 'judiciario' | 'inss'; onChange: (v: 'judiciario' | 'inss') => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-1.5 mb-3">
        <Label className="text-sm font-medium text-foreground">Sistemática de Reajuste da RMI</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] text-xs">
            Define se o reajuste da RMI segue os índices aplicados pelo Poder Judiciário ou pelo INSS administrativamente
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange('judiciario')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            value === 'judiciario'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Judiciário
        </button>
        <button
          type="button"
          onClick={() => onChange('inss')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            value === 'inss'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          INSS
        </button>
      </div>
    </div>
  );
}

export function StepParametros() {
  const { formData, updateFormData, calculoMode } = useCalculo();
  const isInicial = calculoMode === 'inicial';

  // Auto-fill data de atualização from data de término (month/year)
  useEffect(() => {
    if (isInicial && formData.dataTerminoCalculo && formData.dataTerminoCalculo.length === 10) {
      updateFormData({ dataAtualizacao: formData.dataTerminoCalculo });
    }
  }, [formData.dataTerminoCalculo, isInicial]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <MaskedInput
          label="Data de Início do Cálculo"
          value={formData.dataInicioCalculo}
          onChange={(v) => updateFormData({ dataInicioCalculo: v })}
          mask={maskDate}
          placeholder="DD/MM/AAAA"
          tooltip="Data a partir da qual os valores atrasados serão calculados (geralmente a DIB ou data da citação)"
          required
        />
        <MaskedInput
          label="Data de Término do Cálculo"
          value={formData.dataTerminoCalculo}
          onChange={(v) => updateFormData({ dataTerminoCalculo: v })}
          mask={maskDate}
          placeholder="DD/MM/AAAA"
          tooltip="Data até a qual os valores atrasados serão computados"
          required
        />
        <MaskedInput
          label="Data de Atualização"
          value={formData.dataAtualizacao}
          onChange={(v) => updateFormData({ dataAtualizacao: v })}
          mask={maskDate}
          placeholder="DD/MM/AAAA"
          tooltip={isInicial ? "Preenchida automaticamente com base na Data de Término" : "Data base para atualização monetária dos valores (correção e juros)"}
        />
      </div>

      {/* Execução: show Afastar Prescrição */}
      {!isInicial && (
        <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium">Afastar Prescrição</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] text-xs">
                Se ativado, desconsidera o prazo prescricional de 5 anos, incluindo parcelas anteriores
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            checked={formData.afastarPrescricao}
            onCheckedChange={(v) => updateFormData({ afastarPrescricao: v })}
          />
        </div>
      )}

      {/* Inicial: show 13° toggles and Sistemática */}
      {isInicial && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Configurações do 13° Salário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ToggleRow
              id="calcular_13_dezembro"
              label="Calcular 13° apenas em dezembro?"
              checked={formData.calcular13Dezembro}
              onCheckedChange={(v) => updateFormData({ calcular13Dezembro: v })}
              tooltip="Se ativado, o 13° salário será calculado somente na competência de dezembro de cada ano"
            />
            <ToggleRow
              id="incluir_13_ultimo_ano"
              label="Incluir 13° no último ano do cálculo?"
              checked={formData.incluir13UltimoAno}
              onCheckedChange={(v) => updateFormData({ incluir13UltimoAno: v })}
              tooltip="Se ativado, inclui o 13° proporcional ou integral no último ano do período de cálculo"
            />
            <ToggleRow
              id="integral_13_ultimo_ano"
              label="13° integral no último ano do cálculo?"
              checked={formData.integral13UltimoAno}
              onCheckedChange={(v) => updateFormData({ integral13UltimoAno: v })}
              tooltip="Se ativado, considera o 13° integral (e não proporcional) no último ano do período de cálculo"
            />
          </div>
          <SistematicaToggle
            value={formData.sistematicaReajuste}
            onChange={(v) => updateFormData({ sistematicaReajuste: v })}
          />
        </div>
      )}
    </div>
  );
}
