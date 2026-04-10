import { useCalculo } from '@previd/contexts/CalculoContext';
import { User, FileText, Settings, Heart, Cog, Users } from 'lucide-react';
import { cn } from '@previd/lib/utils';

const steps = [
  { label: 'Identificação', icon: User },
  { label: 'Processo', icon: FileText },
  { label: 'Parâmetros', icon: Settings },
  { label: 'Benefício', icon: Heart },
  { label: 'Avançado', icon: Cog },
  { label: 'Dependentes', icon: Users },
];

export function Stepper() {
  const { currentStep, setCurrentStep, completedSteps } = useCalculo();

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-4">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isComplete = completedSteps.has(i);
        const isPast = i < currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => setCurrentStep(i)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  isActive && 'bg-primary border-primary text-primary-foreground shadow-md',
                  isComplete && !isActive && 'bg-success border-success text-success-foreground',
                  !isActive && !isComplete && 'border-step-pending text-muted-foreground group-hover:border-primary/50'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium transition-colors whitespace-nowrap',
                  isActive ? 'text-primary' : isComplete ? 'text-success' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-20px] transition-colors duration-300',
                  isPast || isComplete ? 'bg-success' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
