import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.email_confirmed_at) return <Navigate to="/draft" replace />;

  const handleResend = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email!,
      options: { emailRedirectTo: `${window.location.origin}/draft` },
    });
    setResending(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setResent(true);
      toast({ title: "E-mail reenviado!", description: "Verifique sua caixa de entrada." });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-xl"
      >
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-2xl font-display font-bold mb-2">Verifique seu e-mail</h1>
        <p className="text-muted-foreground mb-2">
          Enviamos um link de confirmação para:
        </p>
        <p className="text-sm font-semibold text-foreground mb-6 bg-secondary rounded-lg px-3 py-2 inline-block">
          {user.email}
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          Clique no link enviado para ativar sua conta e acessar a plataforma.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resending || resent}
            variant="gold"
            className="w-full gap-2"
          >
            {resending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : resent ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {resending ? "Reenviando..." : resent ? "E-mail reenviado!" : "Reenviar E-mail"}
          </Button>

          <Button variant="ghost" onClick={handleLogout} className="w-full gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Sair e voltar ao início
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
