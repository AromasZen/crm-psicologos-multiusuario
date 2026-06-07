"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { plataformaConfig, formatFechaCompleta } from "@/lib/utils"
import type { Recordatorio } from "@/lib/types"
import { Button } from "@/components/ui/button"

export function PendingFollowups() {
  const { usuarioId } = useAuth()
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  const fetchPendientes = useCallback(async () => {
    if (!usuarioId) return
    const supabase = createClient()

    // First get leads belonging to this user
    const { data: userLeads } = await supabase
      .from("leads")
      .select("id")
      .eq("usuario_id", usuarioId)

    if (!userLeads || userLeads.length === 0) {
      setRecordatorios([])
      setLoading(false)
      return
    }

    const leadIds = userLeads.map((l) => l.id)
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("recordatorios")
      .select("*, leads(nombre, numero, plataforma)")
      .in("lead_id", leadIds)
      .eq("completado", false)
      .lte("fecha_recordatorio", today + "T23:59:59")
      .order("fecha_recordatorio", { ascending: true })
      .limit(20)

    if (!error && data) {
      setRecordatorios(data as Recordatorio[])
    }
    setLoading(false)
  }, [usuarioId])

  useEffect(() => {
    fetchPendientes()
  }, [fetchPendientes])

  async function marcarCompletado(id: string) {
    setMarking(id)
    const supabase = createClient()
    await supabase
      .from("recordatorios")
      .update({ completado: true })
      .eq("id", id)
    setRecordatorios((prev) => prev.filter((r) => r.id !== id))
    setMarking(null)
  }

  const isVencido = (fecha: string) => {
    const today = new Date().toISOString().split("T")[0]
    return fecha.split("T")[0] < today
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h2 className="font-semibold text-sm text-foreground">Seguimientos pendientes</h2>
          {recordatorios.length > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              {recordatorios.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchPendientes}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="divide-y divide-border">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-border flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-border rounded w-1/3" />
                <div className="h-2 bg-border rounded w-2/3" />
              </div>
            </div>
          ))
        ) : recordatorios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-muted-foreground">Sin seguimientos pendientes 🎉</p>
          </div>
        ) : (
          recordatorios.map((rec) => {
            const plat = rec.leads?.plataforma
              ? plataformaConfig[rec.leads.plataforma]
              : null
            const vencido = isVencido(rec.fecha_recordatorio)

            return (
              <div
                key={rec.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/50 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-xs font-semibold text-violet-300 flex-shrink-0 mt-0.5">
                  {rec.leads?.nombre?.charAt(0).toUpperCase() ?? "?"}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">
                      {rec.leads?.nombre ?? "Lead eliminado"}
                    </span>
                    {plat && (
                      <span className={`text-xs ${plat.color}`}>{plat.icon} {plat.label}</span>
                    )}
                    {vencido && (
                      <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Vencido
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{rec.descripcion}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatFechaCompleta(rec.fecha_recordatorio)}
                  </p>
                </div>

                {/* Action */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => marcarCompletado(rec.id)}
                  disabled={marking === rec.id}
                  className="flex-shrink-0 text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300"
                >
                  {marking === rec.id ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Hecho
                    </>
                  )}
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
