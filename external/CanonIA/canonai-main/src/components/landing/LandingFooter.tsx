import { Link } from "react-router-dom";
import { Shield, Lock, ShieldCheck, Server, FileText, Scale } from "lucide-react";

const badges = [
  { icon: Lock, label: "Conexão Segura", sub: "256-bit SSL/TLS" },
  { icon: ShieldCheck, label: "LGPD", sub: "Compliance" },
  { icon: Shield, label: "ISO 27001", sub: "Segurança da Informação" },
  { icon: Server, label: "Infraestrutura", sub: "Cloud Global" },
];

export default function LandingFooter() {
  return (
    <>
      {/* Main Footer */}
      <footer id="plans" className="border-t border-border/30 bg-[hsl(220_20%_8%)] pt-14 pb-6">
        <div className="container">
          {/* 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-12">
            {/* Column 1 — Links Rápidos */}
            <div>
              <h4 className="text-sm font-display font-bold text-foreground mb-4 tracking-wide uppercase">
                Links Rápidos
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a>
                </li>
                <li>
                  <a href="#security" className="hover:text-primary transition-colors">Segurança</a>
                </li>
                <li>
                  <a href="#compliance" className="hover:text-primary transition-colors">Marco Legal</a>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-primary transition-colors">Painel</Link>
                </li>
              </ul>
            </div>

            {/* Column 2 — Segurança */}
            <div>
              <h4 className="text-sm font-display font-bold text-foreground mb-4 tracking-wide uppercase flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" strokeWidth={1.5} />
                Segurança de Dados Nível Bancário
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Seus documentos e prompts são processados em ambiente criptografado de ponta a ponta (AES-256).
                Não armazenamos informações sensíveis e seguimos rigorosamente a LGPD.
              </p>
            </div>

            {/* Column 3 — Selos de Confiança */}
            <div>
              <h4 className="text-sm font-display font-bold text-foreground mb-4 tracking-wide uppercase">
                Selos de Confiança
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center gap-2.5 rounded-lg border border-primary/15 bg-primary/[0.04] p-3"
                  >
                    <b.icon className="h-5 w-5 text-primary flex-shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-foreground leading-tight">{b.label}</span>
                      <span className="block text-[10px] text-muted-foreground leading-tight">{b.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/20 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Link to="#" className="hover:text-primary transition-colors flex items-center gap-1">
                <FileText className="h-3 w-3" /> Termos de Uso
              </Link>
              <Link to="#" className="hover:text-primary transition-colors flex items-center gap-1">
                <Scale className="h-3 w-3" /> Política de Privacidade
              </Link>
            </div>
            <span className="text-center">
              © 2026 Canon LegalTech. Todos os direitos reservados. Site Responsável e Auditado.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
