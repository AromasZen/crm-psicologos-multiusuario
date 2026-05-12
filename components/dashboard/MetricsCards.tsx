"use client"

import { useEffect, useState } from "react"
import { Users, MessageSquareOff, TrendingUp, CalendarCheck, BadgeCheck, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { DashboardMetrics } from "@/lib/types"

const metricCards = [
  {
    key: "total" as const,
    label: "Total contactados",
    icon: Users,
    color: "from-slate-600/30 to-slate-700/10",
    iconColor: "text-slate-300",
    borderColor: "border-slate-600/30",
  },
  {
    key: "sin_respuesta" as const,
    label: "Sin respuesta",
    icon: MessageSquareOff,
    color: "from-orange-600/20 to-orange-700/5",
    iconColor: "text-orange-400",
    borderColor: "border-orange-600/20",
  },
  {
    key: "interesados" as const,
    label: "Interesados",
    icon: TrendingUp,
    color: "from-emerald-600/20 to-emerald-700/5",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-600/20",
  },
  {
    key: "demos_agendadas" as const,
    label: "Demos agendadas",
    icon: CalendarCheck,
    color: "from-violet-600/25 to-violet-700/5",
    iconColor: "text-violet-400",
    borderColor: "border-violet-600/25",
  },
  {
    key: "clientes" as const,
    label: "Clientes cerrados",
    icon: BadgeCheck,
    color: "from-amber-600/20 to-amber-700/5",
    iconColor: "text-amber-400",
    borderColor: "border-amber-600/20",
  },
  {
    key: "no_interesados" as const,
    label: "No interesados",
    icon: XCircle,
    color: "from-red-600/20 to-red-700/5",
    iconColor: "text-red-400",
    borderColor: "border-red-600/20",
  },
]

export function MetricsCards() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total: 0,
    sin_respuesta: 0,
    interesados: 0,
    demos_agendadas: 0,
    clientes: 0,
    no_interesados: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("leads")
        .select("estado")

      if (error || !data) {
        setLoading(false)
        return
      }

      const m: DashboardMetrics = {
        total: data.length,
        sin_respuesta: data.filter((l) => l.estado === "sin_respuesta").length,
        interesados: data.filter((l) => l.estado === "interesado").length,
        demos_agendadas: data.filter((l) => l.estado === "demo_agendada").length,
        clientes: data.filter((l) => l.estado === "cliente").length,
        no_interesados: data.filter((l) => l.estado === "no_interesado").length,
      }
      setMetrics(m)
      setLoading(false)
    }
    fetchMetrics()
  }, [])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {metricCards.map(({ key, label, icon: Icon, color, iconColor, borderColor }) => (
        <div
          key={key}
          className={`relative overflow-hidden rounded-xl border ${borderColor} bg-gradient-to-br ${color} p-4 group hover:scale-[1.02] transition-transform duration-200`}
        >
          <div className="flex flex-col gap-3">
            <div className={`w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              {loading ? (
                <div className="h-7 w-12 bg-border rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {metrics[key]}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
            </div>
          </div>
          {/* decorative glow */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  )
}
