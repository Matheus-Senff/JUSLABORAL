import { useCalculo } from '@previd/contexts/CalculoContext';
import { MaskedInput } from '@previd/components/MaskedInput';
import { maskDate } from '@previd/lib/masks';

export function StepIdentificacao() {
  const { formData, updateFormData } = useCalculo();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaskedInput
        label="Nome do Autor"
        value={formData.autor}
        onChange={(v) => updateFormData({ autor: v })}
        placeholder="Nome completo"
        tooltip="Nome completo do autor da ação previdenciária"
        required
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
    </div>
  );
}
