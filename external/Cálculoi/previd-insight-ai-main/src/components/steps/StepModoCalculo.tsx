import { useCalculo, CalculoMode } from '@/contexts/CalculoContext';
import { FilePlus, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
          <motion.button
            key={value}
            whileHover={{ y: -4, boxShadow: '0 8px 30px -12px hsl(217 71% 25% / 0.25)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCalculoMode(value)}
            className={cn(
              'relative flex flex-col items-center gap-4 p-8 rounded-xl border-2 transition-colors duration-200 cursor-pointer text-center bg-card',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50'
            )}
          >
            {/* Radio indicator */}
            <div
              className={cn(
                'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                isSelected ? 'border-primary' : 'border-muted-foreground/40'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              )}
            </div>

            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h3 className={cn('text-base font-semibold mb-1.5', isSelected ? 'text-primary' : 'text-foreground')}>
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
