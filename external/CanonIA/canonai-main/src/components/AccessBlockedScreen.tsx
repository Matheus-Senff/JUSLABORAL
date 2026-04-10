import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessBlockedScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-border/60 bg-card/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Período de teste encerrado</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Você atingiu o limite de 50 envios no plano Free. Faça upgrade para continuar usando a plataforma.
        </p>
        <Button
          variant="gold"
          className="mt-6 h-11 rounded-xl px-6"
          onClick={() => {
            window.location.href = "/#plans";
          }}
        >
          Ver Planos
        </Button>
      </div>
    </div>
  );
}