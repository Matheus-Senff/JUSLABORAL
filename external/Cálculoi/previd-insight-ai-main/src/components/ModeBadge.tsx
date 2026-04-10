import { useCalculo } from '@/contexts/CalculoContext';
import { Badge } from '@/components/ui/badge';
import { FilePlus, Gavel, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ModeBadge() {
  const { calculoMode, setCalculoMode, setCurrentStep, resetFormData } = useCalculo();

  if (!calculoMode) return null;

  const isInicial = calculoMode === 'inicial';

  const handleReset = () => {
    resetFormData();
    setCalculoMode(null);
    setCurrentStep(-1);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="group flex items-center gap-1.5 cursor-pointer">
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 py-1 px-2.5 text-xs font-medium transition-colors',
              isInicial
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-accent/30 bg-accent/10 text-accent'
            )}
          >
            {isInicial ? <FilePlus className="h-3 w-3" /> : <Gavel className="h-3 w-3" />}
            {isInicial ? 'Concessão' : 'Execução'}
            <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Badge>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alterar modalidade?</AlertDialogTitle>
          <AlertDialogDescription>
            Ao alterar a modalidade de cálculo, todos os dados preenchidos serão perdidos. Deseja continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
