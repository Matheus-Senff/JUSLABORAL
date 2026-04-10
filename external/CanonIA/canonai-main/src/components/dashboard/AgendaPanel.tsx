import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DayCounts {
  [dateKey: string]: number;
}

export function AgendaPanel({ userId }: { userId: string | null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayCounts, setDayCounts] = useState<DayCounts>({});

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => {
    async function fetchMonthData() {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      let query = supabase
        .from("generation_history")
        .select("created_at")
        .eq("status", "sent")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data } = await query;
      const counts: DayCounts = {};
      if (data) {
        for (const row of data) {
          const d = new Date(row.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      }
      setDayCounts(counts);
    }
    fetchMonthData();
  }, [year, month, userId]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const maxCount = useMemo(() => Math.max(1, ...Object.values(dayCounts)), [dayCounts]);

  function getIntensity(count: number): string {
    if (count === 0) return "";
    const ratio = count / maxCount;
    if (ratio <= 0.33) return "bg-primary/20";
    if (ratio <= 0.66) return "bg-primary/40";
    return "bg-primary/70";
  }

  return (
    <div className="rounded-xl border border-border bg-gradient-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Agenda de Produção
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const count = dayCounts[dateKey] || 0;
          const isToday = dateKey === todayKey;

          return (
            <Tooltip key={dateKey}>
              <TooltipTrigger asChild>
                <div
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs cursor-default transition-colors relative
                    ${isToday ? "ring-1 ring-primary font-bold" : ""}
                    ${count > 0 ? getIntensity(count) : "hover:bg-secondary/50"}
                  `}
                >
                  <span className={count > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {day}
                  </span>
                  {count > 0 && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{day} de {monthNames[month]}</p>
                <p className="text-muted-foreground">
                  {count === 0
                    ? "Nenhum processo"
                    : count === 1
                      ? "1 processo enviado"
                      : `${count} processos enviados`}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded bg-secondary" />
          <div className="h-3 w-3 rounded bg-primary/20" />
          <div className="h-3 w-3 rounded bg-primary/40" />
          <div className="h-3 w-3 rounded bg-primary/70" />
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}
