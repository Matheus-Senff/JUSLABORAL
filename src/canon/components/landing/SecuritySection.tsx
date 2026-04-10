import { motion } from "framer-motion";
import { ShieldOff, Lock, KeyRound, Trash2 } from "lucide-react";

const points = [
  {
    icon: ShieldOff,
    label: "Inacessibilidade",
    text: "Nenhum membro da equipe Canon tem acesso ao conteúdo das suas minutas. Privacidade total.",
  },
  {
    icon: Lock,
    label: "Criptografia Bancária",
    text: "Proteção com TLS em trânsito e AES-256 em repouso — o mesmo padrão dos maiores bancos do mundo.",
  },
  {
    icon: KeyRound,
    label: "Sem Treinamento de IA",
    text: "Seus dados nunca são utilizados para treinar modelos globais. Sua informação é exclusivamente sua.",
  },
  {
    icon: Trash2,
    label: "Controle Total",
    text: "Exclua qualquer documento a qualquer momento com remoção permanente e irreversível.",
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 md:py-28 border-y border-border/30">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left sticky heading */}
          <motion.div
            className="lg:col-span-2 lg:sticky lg:top-28"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">Privacy-First</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4">
              Sua minuta pertence{" "}
              <span className="text-gradient-blue">apenas a você</span>.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Arquitetura construída desde o primeiro dia para a sensibilidade
              dos dados jurídicos. Sem exceções.
            </p>
          </motion.div>

          {/* Right list */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {points.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-start gap-4 rounded-lg border border-border/50 bg-secondary/20 p-5 hover:border-primary/20 transition-colors duration-300"
              >
                <div className="flex-shrink-0 rounded-md bg-primary/10 p-2">
                  <p.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold">{p.label}</h4>
                  <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">{p.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
