import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();

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

              <div className="mt-6 text-center">
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
