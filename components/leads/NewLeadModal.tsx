"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Plataforma, EstadoLead } from "@/lib/types"

interface NewLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

const defaultForm = {
  nombre: "",
  numero: "",
  plataforma: "whatsapp" as Plataforma,
  fuente: "",
  estado: "sin_respuesta" as EstadoLead,
  notas: "",
  fecha_contacto: new Date().toISOString().slice(0, 10),
}

export function NewLeadModal({ open, onOpenChange, onCreated }: NewLeadModalProps) {
  const { usuarioId } = useAuth()
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.numero.trim()) {
      setError("Nombre y número son obligatorios.")
      return
    }
    if (!usuarioId) {
      setError("Error de autenticación. Recargá la página.")
      return
    }
    setSaving(true)
    setError("")
    const supabase = createClient()

    // Check duplicate by numero for this user
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("numero", form.numero.trim())
      .eq("usuario_id", usuarioId)
      .single()

    if (existing) {
      setError("Ya existe un lead con ese número.")
      setSaving(false)
      return
    }

    const { error: insertError } = await supabase.from("leads").insert({
      usuario_id: usuarioId,
      nombre: form.nombre.trim(),
      numero: form.numero.trim(),
      plataforma: form.plataforma,
      fuente: form.fuente.trim() || null,
      estado: form.estado,
      notas: form.notas.trim() || null,
      fecha_contacto: form.fecha_contacto
        ? new Date(form.fecha_contacto).toISOString()
        : new Date().toISOString(),
      fecha_ultimo_mensaje: null,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setForm(defaultForm)
      onOpenChange(false)
      onCreated()
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="w-4 h-4 text-violet-400" />
            Nuevo lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            {/* Nombre */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre *</Label>
              <Input
                placeholder="Juan Pérez"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="bg-secondary border-border text-sm h-9"
                required
              />
            </div>

            {/* Número */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Número / Usuario *</Label>
              <Input
                placeholder="+54911..."
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                className="bg-secondary border-border text-sm h-9"
                required
              />
            </div>

            {/* Plataforma */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Plataforma</Label>
              <Select
                value={form.plataforma}
                onValueChange={(v) => setForm({ ...form, plataforma: v as Plataforma })}
              >
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="email">✉️ Email</SelectItem>
                  <SelectItem value="otro">📌 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fuente */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fuente</Label>
              <Input
                placeholder="Ej: Referido, Google, etc."
                value={form.fuente}
                onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                className="bg-secondary border-border text-sm h-9"
              />
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Estado inicial</Label>
              <Select
                value={form.estado}
                onValueChange={(v) => setForm({ ...form, estado: v as EstadoLead })}
              >
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="sin_respuesta">Sin respuesta</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  <SelectItem value="interesado">Interesado</SelectItem>
                  <SelectItem value="pasado_a_agustin">Pasado a Agustín</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="no_interesado">No interesado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha contacto */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fecha de contacto</Label>
              <Input
                type="date"
                value={form.fecha_contacto}
                onChange={(e) => setForm({ ...form, fecha_contacto: e.target.value })}
                className="bg-secondary border-border text-sm h-9"
              />
            </div>

            {/* Notas */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Notas</Label>
              <Textarea
                placeholder="Observaciones, contexto del lead..."
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                rows={3}
                className="bg-secondary border-border text-sm resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-muted-foreground hover:text-foreground text-sm h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm h-9"
            >
              <UserPlus className="w-3.5 h-3.5 mr-2" />
              {saving ? "Guardando..." : "Crear lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
