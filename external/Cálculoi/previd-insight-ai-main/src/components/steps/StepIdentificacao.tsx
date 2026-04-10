import { useCalculo } from '@/contexts/CalculoContext';
import { MaskedInput } from '@/components/MaskedInput';
import { maskCPF, maskDate } from '@/lib/masks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function StepIdentificacao() {
  const { formData, updateFormData, calculoMode } = useCalculo();
  const isInicial = calculoMode === 'inicial';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <MaskedInput
        label="Nome do Autor"
        value={formData.autor}
        onChange={(v) => updateFormData({ autor: v })}
        placeholder="Nome completo"
        tooltip="Nome completo do autor da ação previdenciária"
        required
      />
      <MaskedInput
        label="CPF"
        value={formData.cpf}
        onChange={(v) => updateFormData({ cpf: v })}
        mask={maskCPF}
        placeholder="000.000.000-00"
        tooltip="Cadastro de Pessoa Física do autor"
        required={!isInicial}
      />
      <MaskedInput
        label="Data de Nascimento"
        value={formData.nascimento}
        onChange={(v) => updateFormData({ nascimento: v })}
        mask={maskDate}
        placeholder="DD/MM/AAAA"
        tooltip="Data de nascimento do segurado"
        required
      />
      <div>
        <Label className="text-sm font-medium text-foreground mb-1.5 block">
          Sexo {!isInicial && <span className="text-destructive">*</span>}
        </Label>
        <Select value={formData.sexo} onValueChange={(v) => updateFormData({ sexo: v })}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masculino">Masculino</SelectItem>
            <SelectItem value="feminino">Feminino</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
