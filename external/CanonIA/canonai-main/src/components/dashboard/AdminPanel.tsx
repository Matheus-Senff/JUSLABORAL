import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BarChart3, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Period = "hour" | "week" | "month";

interface MemberInfo {
  user_id: string;
  email: string;
  full_name: string | null;
}

interface ChartData {
  label: string;
  count: number;
}

function ProductivityChart({ data, loading }: { data: ChartData[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Carregando dados...
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
        <BarChart3 className="h-8 w-8 opacity-40" />
        Nenhuma minuta enviada no período selecionado.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            color: "hsl(var(--foreground))",
          }}
        />
        <Bar dataKey="count" name="Minutas Enviadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PeriodSelector({ period, setPeriod }: { period: Period; setPeriod: (p: Period) => void }) {
  return (
    <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
      <SelectTrigger className="w-32 h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hour">Por Hora</SelectItem>
        <SelectItem value="week">Por Semana</SelectItem>
        <SelectItem value="month">Por Mês</SelectItem>
      </SelectContent>
    </Select>
  );
}

function useProductivityData(userId: string | null, period: Period) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSent, setTotalSent] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      let query = supabase
        .from("generation_history")
        .select("created_at, user_id")
        .eq("status", "sent");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const now = new Date();
      let startDate: Date;
      if (period === "hour") {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (period === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      query = query.gte("created_at", startDate.toISOString());
      const { data } = await query;

      if (data) {
        setTotalSent(data.length);
        setChartData(groupByPeriod(data, period));
      } else {
        setTotalSent(0);
        setChartData([]);
      }
      setLoading(false);
    }
    fetchStats();
  }, [userId, period]);

  return { chartData, loading, totalSent };
}

/** Member's personal dashboard — only their own data */
export function MemberDashboard({ userId }: { userId: string }) {
  const [period, setPeriod] = useState<Period>("week");
  const { chartData, loading, totalSent } = useProductivityData(userId, period);

  return (
    <div className="rounded-xl border border-border bg-gradient-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display font-bold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Minha Produtividade
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-bold text-foreground">{totalSent}</span> enviadas
          </div>
          <PeriodSelector period={period} setPeriod={setPeriod} />
        </div>
      </div>
      <div className="h-64">
        <ProductivityChart data={chartData} loading={loading} />
      </div>
    </div>
  );
}

/** Admin dashboard with member sidebar */
export function AdminDashboard({ orgId }: { orgId: string }) {
  const [period, setPeriod] = useState<Period>("week");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);

  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("org_id", orgId);

      if (data) {
        const memberInfos: MemberInfo[] = [];
        for (const m of data) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", m.user_id)
            .single();
          memberInfos.push({
            user_id: m.user_id,
            email: profile?.email || m.user_id.slice(0, 8),
            full_name: profile?.full_name || null,
          });
        }
        setMembers(memberInfos);
      }
    }
    fetchMembers();
  }, [orgId]);

  const { chartData, loading, totalSent } = useProductivityData(selectedMember, period);

  return (
    <div className="flex gap-6 h-full">
      {/* Member sidebar */}
      <div className="w-56 shrink-0 rounded-xl border border-border bg-gradient-card p-4">
        <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Membros
        </h3>
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-1">
            <button
              onClick={() => setSelectedMember(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                selectedMember === null
                  ? "bg-primary/15 text-primary font-medium border border-primary/30"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Users className="h-3 w-3 inline mr-1.5" />
              Todos (Equipe)
            </button>
            {members.map((m) => (
              <button
                key={m.user_id}
                onClick={() => setSelectedMember(m.user_id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  selectedMember === m.user_id
                    ? "bg-primary/15 text-primary font-medium border border-primary/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <User className="h-3 w-3 inline mr-1.5" />
                {m.full_name || m.email}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chart area */}
      <div className="flex-1 rounded-xl border border-border bg-gradient-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {selectedMember
              ? `Produtividade — ${members.find(m => m.user_id === selectedMember)?.full_name || members.find(m => m.user_id === selectedMember)?.email || "Membro"}`
              : "Produtividade da Equipe"}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-bold text-foreground">{totalSent}</span> enviadas
            </div>
            <PeriodSelector period={period} setPeriod={setPeriod} />
          </div>
        </div>
        <div className="h-64">
          <ProductivityChart data={chartData} loading={loading} />
        </div>
      </div>
    </div>
  );
}

function groupByPeriod(
  data: { created_at: string; user_id: string }[],
  period: Period
): ChartData[] {
  const map = new Map<string, number>();

  for (const item of data) {
    const date = new Date(item.created_at);
    let key: string;

    if (period === "hour") {
      key = `${date.getHours().toString().padStart(2, "0")}h`;
    } else if (period === "week") {
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      key = days[date.getDay()];
    } else {
      key = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    }

    map.set(key, (map.get(key) || 0) + 1);
  }

  if (period === "hour") {
    const sorted: ChartData[] = [];
    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, "0")}h`;
      sorted.push({ label, count: map.get(label) || 0 });
    }
    return sorted;
  }

  if (period === "week") {
    const order = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    return order.map((label) => ({ label, count: map.get(label) || 0 }));
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}
