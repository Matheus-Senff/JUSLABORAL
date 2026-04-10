import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@canon/components/ui/dialog";
import { Button } from "@canon/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const handleOpenPlans = () => {
    onOpenChange(false);
    window.location.href = "/#plans";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-display">
            Período de teste encerrado
          </DialogTitle>
          <DialogDescription className="text-center">
            Seu período de teste acabou. Assine um plano para continuar gerando minutas com IA.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
          <Sparkles className="h-5 w-5 text-primary mx-auto" />
          <p className="text-sm font-medium">Plano Profissional</p>
          <p className="text-xs text-muted-foreground">Minutas ilimitadas, suporte prioritário e modelos exclusivos.</p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="gold" className="w-full" onClick={handleOpenPlans}>
            Ver Planos de Assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
