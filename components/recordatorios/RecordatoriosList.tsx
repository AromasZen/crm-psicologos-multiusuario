"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { formatFechaCompleta, plataformaConfig, cn } from "@/lib/utils"
import type { Recordatorio } from "@/lib/types"
import { CheckCircle, Clock, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RecordatoriosList() {
  const { usuarioId } = useAuth()
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"pendientes" | "completados" | "todos">("pendientes")

  const fetchRecordatorios = useCallback(async () => {
    if (!usuarioId) return
    setLoading(true)
    const supabase = createClient()

    // Get leads belonging to this user
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

    let query = supabase
      .from("recordatorios")
      .select("*, leads(nombre, numero, plataforma)")
      .in("lead_id", leadIds)
      .order("fecha_recordatorio", { ascending: true })

    if (filter === "pendientes") {
      query = query.eq("completado", false)
    } else if (filter === "completados") {
      query = query.eq("completado", true)
      query = query.order("fecha_recordatorio", { ascending: false })
    }

    const { data, error } = await query

    if (!error && data) {
      setRecordatorios(data as Recordatorio[])
    }
    setLoading(false)
  }, [filter, usuarioId])

  useEffect(() => {
    fetchRecordatorios()
  }, [fetchRecordatorios])

  async function toggleCompletado(id: string, currentState: boolean) {
    const supabase = createClient()
    await supabase
      .from("recordatorios")
      .update({ completado: !currentState })
      .eq("id", id)
    fetchRecordatorios()
  }

  async function eliminarRecordatorio(id: string) {
    if (!confirm("¿Estás seguro de eliminar este recordatorio?")) return
    const supabase = createClient()
    await supabase.from("recordatorios").delete().eq("id", id)
    setRecordatorios(prev => prev.filter(r => r.id !== id))
  }

  const isVencido = (fecha: string) => {
    const today = new Date().toISOString()
    return fecha < today
  }

  return (
    <div className="space-y-4">
      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {(["pendientes", "completados", "todos"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-colors border",
              filter === f
                ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRecordatorios}
          className="ml-auto h-8 border-border text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 mr-2", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border rounded w-1/4" />
                  <div className="h-3 bg-border rounded w-1/2" />
                </div>
              </div>
            ))
          ) : recordatorios.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/20 mb-3" />
              <p className="text-sm">No hay recordatorios {filter === "todos" ? "" : filter}</p>
            </div>
          ) : (
            recordatorios.map((rec) => {
              const vencido = !rec.completado && isVencido(rec.fecha_recordatorio)
              const plat = rec.leads?.plataforma ? plataformaConfig[rec.leads.plataforma] : null

              return (
                <div key={rec.id} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/40 transition-colors group">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1",
                    rec.completado 
                      ? "bg-emerald-600/20 text-emerald-400" 
                      : "bg-violet-600/20 text-violet-400"
                  )}>
                    {rec.leads?.nombre?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-medium text-sm",
                        rec.completado ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
                      )}>
                        {rec.leads?.nombre || "Lead eliminado"}
                      </span>
                      {plat && !rec.completado && (
                        <span className={`text-[11px] ${plat.color}`}>{plat.icon} {plat.label}</span>
                      )}
                      {vencido && (
                        <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Vencido
                        </span>
                      )}
                    </div>
                    
                    <p className={cn(
                      "text-sm mb-2",
                      rec.completado ? "text-muted-foreground/60 line-through decoration-muted-foreground/30" : "text-muted-foreground"
                    )}>
                      {rec.descripcion}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatFechaCompleta(rec.fecha_recordatorio)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCompletado(rec.id, rec.completado)}
                      className={cn(
                        "h-8 border-border hover:bg-secondary",
                        rec.completado ? "text-muted-foreground" : "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                      )}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      {rec.completado ? "Desmarcar" : "Completar"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarRecordatorio(rec.id)}
                      className="h-8 w-8 p-0 border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
