import { useCalculo } from '@previd/contexts/CalculoContext';
import { MaskedInput } from '@previd/components/MaskedInput';
import { maskDate } from '@previd/lib/masks';

export function StepProcesso() {
  const { formData, updateFormData } = useCalculo();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaskedInput
        label="Data de Ajuizamento"
        value={formData.dataAjuizamento}
        onChange={(v) => updateFormData({ dataAjuizamento: v })}
        mask={maskDate}
        placeholder="DD/MM/AAAA"
        tooltip="Data em que a ação foi protocolada no Poder Judiciário"
        required
      />
    </div>
  );
}
