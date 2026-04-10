import { motion } from "framer-motion";
import { Cpu, FileSearch, Scale, Fingerprint } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Orquestração Multi-Modelo",
    description: "GPT, Gemini e Claude operam de forma coordenada. Cada motor assume a etapa onde é mais forte, elevando a qualidade final do documento.",
    num: "01",
  },
  {
    icon: FileSearch,
    title: "Análise Integral de Autos",
    description: "Envie processos completos e obtenha sínteses, pontos críticos e sugestões estratégicas em uma única operação automatizada.",
    num: "02",
  },
  {
    icon: Scale,
    title: "Pesquisa de Precedentes",
    description: "Varredura inteligente em bases de tribunais para localizar julgados alinhados à sua tese, com ranking de relevância e aderência.",
    num: "03",
  },
  {
    icon: Fingerprint,
    title: "Assinatura Argumentativa",
    description: "O sistema aprende seu padrão de escrita e mantém coerência de voz, estrutura e terminologia em todas as peças geradas.",
    num: "04",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">Capacidades</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              Ferramentas que trabalham por você.<br />
              <span className="text-muted-foreground">Resultados que falam por si.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            Recursos calibrados para o dia a dia forense — velocidade sem comprometer a excelência técnica.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="group relative flex gap-5 rounded-xl border border-border/60 bg-gradient-card p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <span className="text-[10px] font-mono text-muted-foreground/50">{f.num}</span>
                <div className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5">
                  <f.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <div className="pt-4">
                <h3 className="text-base font-display font-bold mb-1.5">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
