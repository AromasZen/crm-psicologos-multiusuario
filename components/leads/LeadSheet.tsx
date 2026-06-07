"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { estadoConfig, plataformaConfig, formatFechaCompleta } from "@/lib/utils"
import type { Lead } from "@/lib/types"

interface LeadSheetProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadUpdated: () => void
}

export function LeadSheet({ lead, open, onOpenChange, onLeadUpdated }: LeadSheetProps) {
  // Nuevo recordatorio
  const [recFecha, setRecFecha] = useState("")
  const [recDesc, setRecDesc] = useState("")
  const [savingRec, setSavingRec] = useState(false)

  // Editar notas
  const [editingNotas, setEditingNotas] = useState(false)
  const [notasValue, setNotasValue] = useState("")
  const [savingNotas, setSavingNotas] = useState(false)

  function handleOpen(isOpen: boolean) {
    if (isOpen && lead) {
      // Set default fecha recordatorio a mañana
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setRecFecha(tomorrow.toISOString().slice(0, 16))
      setNotasValue(lead.notas || "")
      setEditingNotas(false)
    }
    onOpenChange(isOpen)
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

  async function saveNotas() {
    if (!lead) return
    setSavingNotas(true)
    const supabase = createClient()
    await supabase
      .from("leads")
      .update({ notas: notasValue.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", lead.id)
    setSavingNotas(false)
    setEditingNotas(false)
    onLeadUpdated()
  }

  if (!lead) return null

  const estadoInfo = estadoConfig[lead.estado]
  const platInfo = plataformaConfig[lead.plataforma]

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
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

          {/* Fuente */}
          {lead.fuente && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Fuente: <span className="text-foreground/80 font-medium">{lead.fuente}</span></span>
            </div>
          )}

          {/* Notas */}
          <div className="mt-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Notas</p>
              {!editingNotas && (
                <button
                  onClick={() => { setNotasValue(lead.notas || ""); setEditingNotas(true) }}
                  className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
            {editingNotas ? (
              <div className="space-y-2">
                <Textarea
                  value={notasValue}
                  onChange={(e) => setNotasValue(e.target.value)}
                  rows={3}
                  className="bg-background border-border text-xs resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={saveNotas}
                    disabled={savingNotas}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-7"
                  >
                    {savingNotas ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingNotas(false)}
                    className="border-border text-xs h-7"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-foreground leading-relaxed">
                {lead.notas || "Sin notas"}
              </p>
            )}
          </div>
        </SheetHeader>

        {/* Recordatorio Section */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground">Nuevo recordatorio</h3>
          </div>

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
      </SheetContent>
    </Sheet>
  )
}
