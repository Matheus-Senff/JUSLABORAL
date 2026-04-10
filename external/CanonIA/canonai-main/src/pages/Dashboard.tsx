import { motion } from "framer-motion";
import {
  Search, Bell, TrendingUp, Scale, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { AdminDashboard, MemberDashboard } from "@/components/dashboard/AdminPanel";
import { AgendaPanel } from "@/components/dashboard/AgendaPanel";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const activities = [
  { text: "Petição inicial protocolada no caso Silva vs. Corp.", time: "Há 15 min" },
  { text: "Novo documento adicionado ao Cofre — NDA Assinada.", time: "Há 1 hora" },
  { text: "Prazo cumprido: Recurso Especial enviado.", time: "Há 3 horas" },
  { text: "Cliente João Mendes atualizou dados cadastrais.", time: "Há 5 horas" },
];

function DashboardContent({ activeTab }: { activeTab: "processos" | "agenda" }) {
  const { user } = useAuth();
  const { isAdmin, orgId } = useAdminStatus(user?.id);
  const { credits } = useCredits();
  const navigate = useNavigate();
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function fetchSentCount() {
      const { count } = await supabase
        .from("generation_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "sent");
      setSentCount(count ?? 0);
    }
    fetchSentCount();
  }, [user]);

  const stats = [
    { label: "Processos Ativos", value: "147", icon: Scale, change: "+12%" },
    { label: "Minutas Enviadas", value: String(sentCount), icon: TrendingUp, change: "Apenas enviadas" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" onClick={() => navigate("/draft")} className="text-xs text-muted-foreground gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar à Plataforma
          </Button>
          <div className="relative w-64 md:w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Busca Unificada de Processos..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-danger animate-pulse" />
          </button>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {user?.email?.slice(0, 2).toUpperCase() || "??"}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold">
              {activeTab === "processos" ? "Processos" : "Agenda"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "processos"
                ? "Visão geral de produtividade e prazos"
                : "Calendário de produção de processos"}
            </p>
          </div>

          {/* Credits counter */}
          {credits !== null && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {credits}
              </div>
              <div>
                <p className="text-sm font-medium">
                  Você possui <span className="text-primary font-bold">{credits}</span> minuta{credits !== 1 ? "s" : ""} de teste restante{credits !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {credits > 0 ? "Cada exportação consome 1 crédito." : "Assine um plano para continuar gerando minutas."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "processos" ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-gradient-card p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="h-4 w-4 text-primary" />
                      <span className="text-xs text-primary font-medium">{stat.change}</span>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 mb-6">
                <div className="rounded-xl border border-border bg-gradient-card p-5">
                  <h2 className="font-display font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Atividades Recentes
                  </h2>
                  <div className="space-y-4">
                    {activities.map((a, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-3"
                      >
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-sm">{a.text}</p>
                          <p className="text-xs text-muted-foreground">{a.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role-based productivity panel */}
              {isAdmin && orgId ? (
                <AdminDashboard orgId={orgId} />
              ) : user ? (
                <MemberDashboard userId={user.id} />
              ) : null}
            </>
          ) : (
            /* Agenda tab */
            <AgendaPanel userId={user?.id ?? null} />
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"processos" | "agenda">("processos");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <DashboardContent activeTab={activeTab} />
      </div>
    </SidebarProvider>
  );
}
