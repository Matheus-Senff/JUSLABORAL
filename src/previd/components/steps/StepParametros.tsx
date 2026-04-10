import { useCalculo } from '@previd/contexts/CalculoContext';
import { MaskedInput } from '@previd/components/MaskedInput';
import { maskDate } from '@previd/lib/masks';
import { useEffect } from 'react';

export function StepParametros() {
  const { formData, updateFormData } = useCalculo();

  // Sistemática fixada como Judiciário
  useEffect(() => {
    if (formData.sistematicaReajuste !== 'judiciario') {
      updateFormData({ sistematicaReajuste: 'judiciario' });
    }
  }, []);

  // Auto-fill data de atualização
  useEffect(() => {
    if (formData.dataTerminoCalculo && formData.dataTerminoCalculo.length === 10) {
      updateFormData({ dataAtualizacao: formData.dataTerminoCalculo });
    }
  }, [formData.dataTerminoCalculo]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaskedInput
        label="Data de Início do Cálculo"
        value={formData.dataInicioCalculo}
        onChange={(v) => updateFormData({ dataInicioCalculo: v })}
        mask={maskDate}
        placeholder="DD/MM/AAAA"
        tooltip="Data a partir da qual os valores atrasados serão calculados"
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
        tooltip="Preenchida automaticamente com base na Data de Término"
      />
    </div>
  );
}
