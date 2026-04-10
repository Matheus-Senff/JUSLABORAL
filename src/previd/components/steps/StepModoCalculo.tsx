import { useCalculo, CalculoMode } from '@previd/contexts/CalculoContext';
import { FilePlus, Gavel } from 'lucide-react';
import { cn } from '@previd/lib/utils';

const modes: { value: CalculoMode; title: string; description: string; Icon: typeof FilePlus }[] = [
  {
    value: 'inicial',
    title: 'Cálculo Inicial (Concessão)',
    description: 'Para novos benefícios, revisões e projeções de RMI.',
    Icon: FilePlus,
  },
  {
    value: 'execucao',
    title: 'Cálculo de Execução (Cumprimento de Sentença)',
    description: 'Para apurar parcelas atrasadas, juros e correção monetária após sentença judicial.',
    Icon: Gavel,
  },
];

export function StepModoCalculo() {
  const { calculoMode, setCalculoMode } = useCalculo();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {modes.map(({ value, title, description, Icon }) => {
        const isSelected = calculoMode === value;
        return (
          <button
            key={value}
            onClick={() => setCalculoMode(value)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-3 aspect-square w-[270px] h-[270px] rounded-2xl border-2 transition-colors duration-200 cursor-pointer text-center bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 shadow-xl text-xl',
              isSelected
                ? 'border-primary bg-primary/10 shadow-2xl'
                : 'border-border hover:border-primary/50'
            )}
            style={{ fontSize: '1.15rem' }}
          >
            {/* Radio indicator */}
            <div
              className={cn(
                'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                isSelected ? 'border-primary' : 'border-muted-foreground/40'
              )}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>

            <div
              className={cn(
                'w-16 h-16 rounded-xl flex items-center justify-center mb-2 transition-colors border-2',
                isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-zinc-700'
              )}
            >
              <Icon className="h-9 w-9" />
            </div>
            <div className="flex flex-col items-center justify-center w-full">
              <h3 className={cn('text-lg font-bold mb-1.5 tracking-tight', isSelected ? 'text-primary' : 'text-foreground')}>
                {title}
              </h3>
              <p className="text-base text-muted-foreground leading-snug max-w-[90%] mx-auto text-center">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
