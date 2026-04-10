import { useCalculo } from '@/contexts/CalculoContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { MaskedInput } from '@/components/MaskedInput';

export function StepAvancado() {
  const { formData, updateFormData, calculoMode } = useCalculo();
  const isInicial = calculoMode === 'inicial';

  if (isInicial) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-base font-semibold text-foreground">Correção Monetária</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] text-xs">
                  Aplica correção monetária conforme cadeia de índices da Res. CJF 963/2025 e SONPREV
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={formData.correcaoMonetaria}
              onCheckedChange={(v) => updateFormData({ correcaoMonetaria: v })}
              className="data-[state=checked]:bg-success"
            />
          </div>

          {formData.correcaoMonetaria && (
            <div className="space-y-4 pt-2">
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="text-xs text-foreground space-y-1">
                    <p className="font-semibold">Cadeia de Índices: SONPREV / Res. CJF 963/2025 (Previdenciário)</p>
                    <p>Série composta pelos seguintes indexadores conforme período:</p>
                    <ul className="list-disc list-inside ml-1 space-y-0.5">
                      <li><strong>IGP-DI</strong> de 05/1996 a 08/2006 — Lei 9.711/98 (FGV/IBRE)</li>
                      <li><strong>INPC</strong> de 09/2006 a 11/2021 — Lei 8.213/91, STJ Tema 905</li>
                      <li><strong>SELIC</strong> a partir de 12/2021 — EC 113/2021, art. 3° (engloba correção + juros)</li>
                    </ul>
                    <p className="mt-2 font-semibold">Juros de mora (pré-12/2021):</p>
                    <ul className="list-disc list-inside ml-1 space-y-0.5">
                      <li>Até 06/2009: <strong>1% a.m.</strong> (CC art. 406)</li>
                      <li>07/2009 a 11/2021: <strong>Juros de poupança</strong> (Lei 11.960/09, art. 1°-F)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Toggle para modo precatório (EC 136/2025) */}
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-medium">Expedição de Requisitório (Precatório)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] text-xs">
                      Ativa regra de precatórios conforme EC 136/2025: IPCA como indexador + juros de 2% ao ano
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  checked={formData.modoPrecatorio}
                  onCheckedChange={(v) => updateFormData({ modoPrecatorio: v })}
                />
              </div>

              {formData.modoPrecatorio ? (
                <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-foreground space-y-1">
                      <p className="font-semibold">EC 136/2025 — Regime de Precatórios</p>
                      <ul className="list-disc list-inside ml-1 space-y-0.5">
                        <li>Correção monetária pelo <strong>IPCA</strong> (Índice Nacional de Preços ao Consumidor Amplo)</li>
                        <li>Juros de mora: <strong>2% ao ano</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border p-4 bg-muted/30">
                    <p className="text-xs font-semibold text-foreground mb-1">05/1996 a 08/2006</p>
                    <p className="text-xs text-muted-foreground">
                      Correção pelo <strong>IGP-DI</strong> (Índice Geral de Preços — Disponibilidade Interna),
                      conforme Lei 9.711/98. Fonte: FGV/IBRE.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4 bg-muted/30">
                    <p className="text-xs font-semibold text-foreground mb-1">09/2006 a 11/2021</p>
                    <p className="text-xs text-muted-foreground">
                      Correção pelo <strong>INPC</strong> (IBGE), conforme STJ Tema 905 e Res. CJF 963/2025.
                      Juros de mora pela taxa de poupança (Lei 11.960/09).
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4 bg-muted/30">
                    <p className="text-xs font-semibold text-foreground mb-1">A partir de 12/2021</p>
                    <p className="text-xs text-muted-foreground">
                      Atualização pela <strong>Taxa SELIC</strong>, que já inclui juros de mora, conforme
                      EC 113/2021 (art. 3°). Não há incidência de juros separados.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modo Execução
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Limitação ao Teto</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs">
              Aplicar o teto do INSS vigente em cada competência ao valor do benefício
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          checked={formData.limitarTeto}
          onCheckedChange={(v) => updateFormData({ limitarTeto: v })}
        />
      </div>
      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Adicional de 25%</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs">
              Acréscimo de 25% sobre o valor do benefício para segurados que necessitam de assistência permanente (art. 45 da Lei 8.213/91)
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          checked={formData.adicional25}
          onCheckedChange={(v) => updateFormData({ adicional25: v })}
        />
      </div>
      <MaskedInput
        label="Benefício Anterior"
        value={formData.beneficioAnterior}
        onChange={(v) => updateFormData({ beneficioAnterior: v })}
        placeholder="Número do benefício anterior"
        tooltip="Número do benefício que antecedeu o atual"
      />
      <MaskedInput
        label="Benefício Precedido"
        value={formData.beneficioPrecedido}
        onChange={(v) => updateFormData({ beneficioPrecedido: v })}
        placeholder="Número do benefício precedido"
        tooltip="Número do benefício originário que deu causa ao atual"
      />
    </div>
  );
}
