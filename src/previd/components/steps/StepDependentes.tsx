import { useCalculo, Dependente } from '@previd/contexts/CalculoContext';
import { MaskedInput } from '@previd/components/MaskedInput';
import { maskCPF, maskDate } from '@previd/lib/masks';
import { Button } from '@previd/components/ui/button';
import { Plus, Trash2, Calculator, FileText, Loader2 } from 'lucide-react';
import { Card } from '@previd/components/ui/card';
import { Label } from '@previd/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@previd/components/ui/select';
import { ResultadosCalculo } from '@previd/components/ResultadosCalculo';
import { toast } from '@previd/hooks/use-toast';
import { useState } from 'react';

export function StepDependentes() {
  const { formData, updateFormData, calculoMode, executarCalculo } = useCalculo();
  const isInicial = calculoMode === 'inicial';
  const [isCalculating, setIsCalculating] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleCalcular = () => {
    setIsCalculating(true);
    try {
      // Executar cálculo usando o contexto
      const result = executarCalculo();
      setMostrarResultados(true);
      toast({
        title: 'Cálculo realizado com sucesso!',
        description: `Valor total: ${result.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      });
    } catch (err: any) {
      toast({
        title: 'Erro no cálculo',
        description: err.message || 'Verifique os dados preenchidos.',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGerarPDF = () => {
    // TODO: Implementar geração de PDF com os novos resultados
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'A geração de PDF será implementada em breve.',
    });
  };

  if (isInicial) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Calcular Valores</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Todos os dados foram preenchidos. Clique no botão abaixo para executar o cálculo
            previdenciário com correção monetária, juros moratórios e gerar o relatório em PDF.
          </p>
          <Button
            size="lg"
            onClick={handleCalcular}
            disabled={isCalculating}
            className="gap-2 px-8"
          >
            {isCalculating ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Calculando...</>
            ) : (
              <><Calculator className="h-5 w-5" /> Calcular Valores</>
            )}
          </Button>
        </div>

        {mostrarResultados && (
          <div className="mt-8">
            <ResultadosCalculo />
          </div>
        )}
      </div>
    );
  }

  // Modo Execução: dependentes original
  const deps = formData.dependentes;

  const addDependente = () => {
    const novo: Dependente = {
      id: crypto.randomUUID(),
      nome: '', cpf: '', nascimento: '', inicioCotas: '', fimCotas: '', parentesco: '',
    };
    updateFormData({ dependentes: [...deps, novo] });
  };

  const updateDep = (id: string, field: keyof Dependente, value: string) => {
    updateFormData({
      dependentes: deps.map(d => d.id === id ? { ...d, [field]: value } : d),
    });
  };

  const removeDep = (id: string) => {
    updateFormData({ dependentes: deps.filter(d => d.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Adicione os dependentes habilitados para rateio de cotas do benefício.
        </p>
        <Button variant="outline" size="sm" onClick={addDependente} className="gap-1.5">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      {deps.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          Nenhum dependente cadastrado. Clique em "Adicionar" para incluir.
        </div>
      )}

      {deps.map((dep, idx) => (
        <Card key={dep.id} className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Dependente {idx + 1}</span>
            <Button variant="ghost" size="sm" onClick={() => removeDep(dep.id)} className="text-destructive hover:text-destructive h-8 w-8 p-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MaskedInput label="Nome" value={dep.nome} onChange={(v) => updateDep(dep.id, 'nome', v)} placeholder="Nome completo" required />
            <MaskedInput label="CPF" value={dep.cpf} onChange={(v) => updateDep(dep.id, 'cpf', v)} mask={maskCPF} placeholder="000.000.000-00" />
            <MaskedInput label="Nascimento" value={dep.nascimento} onChange={(v) => updateDep(dep.id, 'nascimento', v)} mask={maskDate} placeholder="DD/MM/AAAA" />
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Parentesco</Label>
              <Select value={dep.parentesco} onValueChange={(v) => updateDep(dep.id, 'parentesco', v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conjuge">Cônjuge/Companheiro(a)</SelectItem>
                  <SelectItem value="filho">Filho(a)</SelectItem>
                  <SelectItem value="pai">Pai/Mãe</SelectItem>
                  <SelectItem value="irmao">Irmão(ã)</SelectItem>
                  <SelectItem value="enteado">Enteado(a)</SelectItem>
                  <SelectItem value="menor_tutelado">Menor Tutelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <MaskedInput label="Início da Cota" value={dep.inicioCotas} onChange={(v) => updateDep(dep.id, 'inicioCotas', v)} mask={maskDate} placeholder="DD/MM/AAAA" tooltip="Data de início do direito à cota-parte do dependente" />
            <MaskedInput label="Fim da Cota" value={dep.fimCotas} onChange={(v) => updateDep(dep.id, 'fimCotas', v)} mask={maskDate} placeholder="DD/MM/AAAA" tooltip="Data de cessação da cota-parte (ex: maioridade)" />
          </div>
        </Card>
      ))}
    </div>
  );
}
