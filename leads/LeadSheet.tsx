"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MessageSquare,
  Bell,
  Send,
  ArrowDown,
  ArrowUp,
  Plus,
  Calendar,
  Clock,
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { estadoConfig, plataformaConfig, formatFechaCompleta } from "@/lib/utils"
import type { Lead, Mensaje, Recordatorio, EstadoLead } from "@/lib/types"

interface LeadSheetProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadUpdated: () => void
}

type TabType = "mensajes" | "recordatorio"

export function LeadSheet({ lead, open, onOpenChange, onLeadUpdated }: LeadSheetProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [loadingMensajes, setLoadingMensajes] = useState(false)
  const [tab, setTab] = useState<TabType>("mensajes")

  // Nuevo mensaje
  const [msgTipo, setMsgTipo] = useState<"enviado" | "recibido">("enviado")
  const [msgContenido, setMsgContenido] = useState("")
  const [savingMsg, setSavingMsg] = useState(false)

  // Nuevo recordatorio
  const [recFecha, setRecFecha] = useState("")
  const [recDesc, setRecDesc] = useState("")
  const [savingRec, setSavingRec] = useState(false)

  const fetchMensajes = useCallback(async () => {
    if (!lead) return
    setLoadingMensajes(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("mensajes")
      .select("*")
      .eq("lead_id", lead.id)
      .order("fecha", { ascending: true })
    setMensajes((data as Mensaje[]) ?? [])
    setLoadingMensajes(false)
  }, [lead])

  useEffect(() => {
    if (open && lead) {
      fetchMensajes()
      // Set default fecha recordatorio a mañana
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setRecFecha(tomorrow.toISOString().slice(0, 16))
    }
  }, [open, lead, fetchMensajes])

  async function saveMessage() {
    if (!lead || !msgContenido.trim()) return
    setSavingMsg(true)
    const supabase = createClient()
    await supabase.from("mensajes").insert({
      lead_id: lead.id,
      fecha: new Date().toISOString(),
      tipo: msgTipo,
      contenido: msgContenido.trim(),
    })
    // Update fecha_ultimo_mensaje
    await supabase
      .from("leads")
      .update({ fecha_ultimo_mensaje: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", lead.id)
    setMsgContenido("")
    setSavingMsg(false)
    fetchMensajes()
    onLeadUpdated()
  }

  async function saveRecordatorio() {
    if (!lead || !recDesc.trim() || !recFecha) return
    setSavingRec(true)
    const supabase = createClient()
    await supabase.from("recordatorios").insert({
      lead_id: lead.id,
      fecha_recordatorio: new Date(recFecha).toISOString(),
      descripcion: recDesc.trim(),
      completado: false,
    })
    setRecDesc("")
    setSavingRec(false)
    alert("Recordatorio creado ✓")
  }

  if (!lead) return null

  const estadoInfo = estadoConfig[lead.estado]
  const platInfo = plataformaConfig[lead.plataforma]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] bg-card border-border overflow-y-auto p-0"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border space-y-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center text-base font-bold text-violet-300 flex-shrink-0">
              {lead.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold text-foreground">
                {lead.nombre}
              </SheetTitle>
              <p className={`text-xs mt-0.5 font-medium ${platInfo.color}`}>
                {platInfo.icon} {platInfo.label} · {lead.numero}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full border font-medium flex-shrink-0 ${estadoInfo.color}`}
            >
              {estadoInfo.label}
            </span>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Primer contacto</p>
              <p className="text-xs text-foreground mt-0.5">
                {formatFechaCompleta(lead.fecha_contacto)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Último mensaje</p>
              <p className="text-xs text-foreground mt-0.5">
                {formatFechaCompleta(lead.fecha_ultimo_mensaje)}
              </p>
            </div>
          </div>

          {lead.notas && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notas</p>
              <p className="text-xs text-foreground leading-relaxed">{lead.notas}</p>
            </div>
          )}
        </SheetHeader>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["mensajes", "recordatorio"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                tab === t
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "mensajes" ? (
                <><MessageSquare className="w-3.5 h-3.5" /> Mensajes</>
              ) : (
                <><Bell className="w-3.5 h-3.5" /> Recordatorio</>
              )}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {tab === "mensajes" ? (
            <>
              {/* Historial de mensajes */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {loadingMensajes ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-secondary rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : mensajes.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Sin mensajes registrados</p>
                  </div>
                ) : (
                  mensajes.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.tipo === "enviado" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                          msg.tipo === "enviado"
                            ? "bg-violet-600/25 text-violet-100 rounded-tr-sm"
                            : "bg-secondary text-foreground rounded-tl-sm"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {msg.tipo === "enviado" ? (
                            <ArrowUp className="w-2.5 h-2.5 text-violet-400" />
                          ) : (
                            <ArrowDown className="w-2.5 h-2.5 text-emerald-400" />
                          )}
                          <span className="text-[10px] opacity-60">
                            {formatFechaCompleta(msg.fecha)}
                          </span>
                        </div>
                        {msg.contenido}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator className="bg-border" />

              {/* Registrar nuevo mensaje */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Registrar mensaje
                </h3>
                <div className="flex gap-2">
                  {(["enviado", "recibido"] as const).map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setMsgTipo(tipo)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        msgTipo === tipo
                          ? tipo === "enviado"
                            ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                            : "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tipo === "enviado" ? (
                        <><ArrowUp className="w-3 h-3 inline mr-1" />Enviado</>
                      ) : (
                        <><ArrowDown className="w-3 h-3 inline mr-1" />Recibido</>
                      )}
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Escribí el contenido del mensaje..."
                  value={msgContenido}
                  onChange={(e) => setMsgContenido(e.target.value)}
                  rows={3}
                  className="bg-secondary border-border text-sm resize-none"
                />
                <Button
                  onClick={saveMessage}
                  disabled={savingMsg || !msgContenido.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm h-9"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  {savingMsg ? "Guardando..." : "Registrar mensaje"}
                </Button>
              </div>
            </>
          ) : (
            /* Tab Recordatorio */
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nuevo recordatorio
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Fecha y hora
                  </Label>
                  <Input
                    type="datetime-local"
                    value={recFecha}
                    onChange={(e) => setRecFecha(e.target.value)}
                    className="bg-secondary border-border text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Descripción
                  </Label>
                  <Textarea
                    placeholder="¿Qué tenés que hacer? Ej: Llamar para hacer seguimiento, enviar propuesta..."
                    value={recDesc}
                    onChange={(e) => setRecDesc(e.target.value)}
                    rows={3}
                    className="bg-secondary border-border text-sm resize-none"
                  />
                </div>
                <Button
                  onClick={saveRecordatorio}
                  disabled={savingRec || !recDesc.trim() || !recFecha}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm h-9"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  {savingRec ? "Creando..." : "Crear recordatorio"}
                </Button>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  💡 El recordatorio aparecerá en el dashboard en la sección &quot;Seguimientos pendientes&quot; cuando llegue la fecha.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
