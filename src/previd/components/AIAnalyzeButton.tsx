import { Sparkles } from 'lucide-react';
import { Button } from '@previd/components/ui/button';
import { useCalculo } from '@previd/contexts/CalculoContext';
import { toast } from '@previd/hooks/use-toast';

interface AIAnalyzeButtonProps {
  stepName: string;
}

export function AIAnalyzeButton({ stepName }: AIAnalyzeButtonProps) {
  const { formData } = useCalculo();

  const handleAnalyze = () => {
    const payload = JSON.stringify(formData, null, 2);
    console.log(`[IA] Payload para análise (${stepName}):`, payload);
    toast({
      title: 'Análise com IA',
      description: `Payload da etapa "${stepName}" preparado para envio via webhook. Verifique o console.`,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAnalyze}
      className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Sparkles className="h-4 w-4" />
      Analisar com IA
    </Button>
  );
}
