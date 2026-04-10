import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@canon/components/ui/button";
import { Input } from "@canon/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@canon/integrations/supabase/client";
import { useToast } from "@canon/hooks/use-toast";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroSection() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/draft` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
      });
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/draft");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/draft` },
        });
        if (error) throw error;
        toast({
          title: "Conta criada!",
          description: "Verifique seu e-mail para confirmar o cadastro.",
        });
        navigate("/verify-email");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
          "repeating-linear-gradient(0deg, hsl(var(--blue-accent)) 0px, hsl(var(--blue-accent)) 1px, transparent 1px, transparent 80px)",
        }}
      />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <motion.div initial="hidden" animate="visible">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-6"
            >
              <Sparkles className="h-3 w-3" />
              Tecnologia Jurídica de Ponta
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl md:text-5xl font-display font-black leading-[1.1] tracking-tight mb-5"
            >
              Redija, analise e pesquise com inteligência artificial feita sob medida para o{" "}
              <span className="text-gradient-blue">universo jurídico</span>.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed"
            >
              Três motores de IA atuando em sinergia para entregar documentos
              com rigor técnico, coerência argumentativa e a voz do seu escritório.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-8 pt-6 border-t border-border/30"
            >
              {[
                { value: "3 IAs", label: "Motores combinados" },
                { value: "70%", label: "Ganho de produtividade" },
                { value: "100%", label: "Adequação regulatória" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-display font-black text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — login card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-border/40 bg-glass p-8 md:p-10 shadow-2xl shadow-background/60">
              <div className="text-center mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold">
                  {isLogin ? "Acessar Plataforma" : "Criar Conta"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLogin
                    ? "Entre com suas credenciais para continuar"
                    : "Cadastre-se para começar a usar"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full h-11 text-sm rounded-lg mt-2"
                  disabled={loading}
                >
                  {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </form>

              {/* Divisor */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-glass px-2 text-muted-foreground tracking-wider">ou</span>
                </div>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-border/50 bg-secondary/40 hover:bg-secondary/70 transition-colors text-sm font-medium disabled:opacity-60"
              >
                {loadingGoogle ? (
                  <svg className="animate-spin h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {loadingGoogle ? "Redirecionando..." : "Continuar com Google"}
              </button>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Não tem conta? " : "Já tem conta? "}
                  <span className="font-semibold text-primary">
                    {isLogin ? "Cadastre-se" : "Fazer login"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
