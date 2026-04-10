import { useCalculo } from '@/contexts/CalculoContext';
import { MaskedInput } from '@/components/MaskedInput';
import { maskDate, maskPercentage } from '@/lib/masks';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

function ToggleRow({
  id, label, checked, onCheckedChange, disabled = false, hint,
}: {
  id: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean; hint?: string;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg border border-border p-4 transition-colors ${disabled ? 'opacity-50' : 'hover:border-primary/30'}`}>
      <div className="space-y-0.5">
        <Label htmlFor={id} className={`text-sm font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
        </Label>
        {hint && (
          <p className="flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            {hint}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-success"
      />
    </div>
  );
}

export function StepProcesso() {
  const { formData, updateFormData, calculoMode } = useCalculo();
  const isInicial = calculoMode === 'inicial';

  const handleVincendasChange = (v: boolean) => {
    updateFormData({ incluir12Vincendas: v, ...(v ? {} : { incluir13Vincendas: false }) });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <MaskedInput
          label="NUP (Número Único de Processo)"
          value={formData.nup}
          onChange={(v) => updateFormData({ nup: v })}
          placeholder="0000000-00.0000.0.00.0000"
          tooltip="Número Único de Processo judicial no formato CNJ"
          required={!isInicial}
        />
        <MaskedInput
          label="Data de Ajuizamento"
          value={formData.dataAjuizamento}
          onChange={(v) => updateFormData({ dataAjuizamento: v })}
          mask={maskDate}
          placeholder="DD/MM/AAAA"
          tooltip="Data em que a ação foi protocolada no Poder Judiciário"
          required
        />
        <MaskedInput
          label="Data de Citação"
          value={formData.dataCitacao}
          onChange={(v) => updateFormData({ dataCitacao: v })}
          mask={maskDate}
          placeholder="DD/MM/AAAA"
          tooltip="Data em que o réu (INSS) foi oficialmente notificado da ação"
        />
        <MaskedInput
          label="% de Renúncia"
          value={formData.percentualRenuncia}
          onChange={(v) => updateFormData({ percentualRenuncia: v })}
          mask={maskPercentage}
          placeholder="0,00%"
          tooltip="Percentual do crédito que o autor renuncia para adequar-se à competência do JEF (até 60 salários mínimos)"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Opções de Valor da Causa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ToggleRow
            id="apurar_vc"
            label="Apurar o valor da causa?"
            checked={formData.apurarVC}
            onCheckedChange={(v) => updateFormData({ apurarVC: v })}
          />
          <ToggleRow
            id="limitar_60_sm"
            label="Limitar o valor da causa a 60 salários?"
            checked={formData.limitar60SM}
            onCheckedChange={(v) => updateFormData({ limitar60SM: v })}
            hint={formData.limitar60SM ? 'O cálculo será truncado no teto dos Juizados Especiais Federais (JEF).' : undefined}
          />
          <ToggleRow
            id="incluir_12_vincendas"
            label="Acrescentar 12 vincendas?"
            checked={formData.incluir12Vincendas}
            onCheckedChange={handleVincendasChange}
          />
          <ToggleRow
            id="incluir_13_vincendas"
            label="Acrescentar 13º nas vincendas?"
            checked={formData.incluir13Vincendas}
            onCheckedChange={(v) => updateFormData({ incluir13Vincendas: v })}
            disabled={!formData.incluir12Vincendas}
          />
        </div>
      </div>
    </div>
  );
}
