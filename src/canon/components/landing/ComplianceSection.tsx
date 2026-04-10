import { motion } from "framer-motion";
import { ShieldCheck, Landmark } from "lucide-react";

export default function ComplianceSection() {
  return (
    <section id="compliance" className="py-20 md:py-28">
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">Marco Legal</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Infraestrutura regulatória que sustenta cada operação
          </h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          {[
            {
              icon: ShieldCheck,
              title: "Aderência à LGPD",
              text: "Todo o ciclo de vida dos dados segue a Lei Geral de Proteção de Dados, com registros auditáveis e governança transparente.",
            },
            {
              icon: Landmark,
              title: "Alinhamento ao CNJ 615/2025",
              text: "Arquitetura projetada em conformidade com as diretrizes do Conselho Nacional de Justiça sobre IA no ecossistema judiciário.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              className="flex-1 rounded-xl border border-primary/15 bg-primary/[0.03] p-7 text-center"
            >
              <item.icon className="h-8 w-8 text-primary mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-display font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
