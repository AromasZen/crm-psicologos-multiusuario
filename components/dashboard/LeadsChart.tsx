"use client"

import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { createClient } from "@/lib/supabase"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  sin_respuesta: { label: "Sin respuesta", color: "#f97316" },
  interesado:    { label: "Interesados",   color: "#10b981" },
  demo_agendada: { label: "Demo agendada", color: "#8b5cf6" },
  cliente:       { label: "Clientes",      color: "#f59e0b" },
  no_interesado: { label: "No interesados",color: "#ef4444" },
}

type ChartEntry = { name: string; value: number; color: string }

// ── Custom tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
      <span className="text-muted-foreground">{name}:</span>{" "}
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}

// ── Custom legend ───────────────────────────────────────────────────────────
function CustomLegend({ data }: { data: ChartEntry[] }) {
  return (
    <ul className="flex flex-col gap-1.5 text-xs">
      {data.map((entry) => (
        <li key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground truncate">{entry.name}</span>
          <span className="ml-auto font-semibold text-foreground tabular-nums">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export function LeadsChart() {
  const [data, setData] = useState<ChartEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: rows, error } = await supabase
        .from("leads")
        .select("estado")

      if (error || !rows) { setLoading(false); return }

      // Aggregate counts per estado
      const counts: Record<string, number> = {}
      for (const { estado } of rows) {
        if (!estado) continue
        counts[estado] = (counts[estado] ?? 0) + 1
      }

      const entries: ChartEntry[] = Object.entries(counts)
        .filter(([key]) => STATUS_CONFIG[key])
        .map(([key, value]) => ({
          name:  STATUS_CONFIG[key].label,
          value,
          color: STATUS_CONFIG[key].color,
        }))
        .sort((a, b) => b.value - a.value)

      setData(entries)
      setTotal(rows.length)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-foreground">Distribución de leads</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Por estado actual</p>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="flex-1 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-[12px] border-border border-t-primary animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
          Sin datos aún
        </div>
      ) : (
        <div className="flex items-center gap-4 flex-1 min-h-0">
          {/* Donut */}
          <div className="relative w-[140px] h-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  animationBegin={0}
                  animationDuration={700}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-foreground tabular-nums">{total}</span>
              <span className="text-[10px] text-muted-foreground">total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 min-w-0">
            <CustomLegend data={data} />
          </div>
        </div>
      )}
    </div>
  )
}
