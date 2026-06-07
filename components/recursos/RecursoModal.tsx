"use client"

import { useState, useEffect } from "react"
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
import { FileText, PlusCircle, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { Recurso, TipoRecurso } from "@/lib/types"

interface RecursoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  recurso?: Recurso | null
}

const defaultForm = {
  tipo: "mensaje" as TipoRecurso,
  categoria: "primer_contacto",
  titulo: "",
  contenido: "",
  orden: 0,
}

export function RecursoModal({ open, onOpenChange, onSaved, recurso }: RecursoModalProps) {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (recurso) {
      setForm({
        tipo: recurso.tipo,
        categoria: recurso.categoria || "primer_contacto",
        titulo: recurso.titulo,
        contenido: recurso.contenido,
        orden: recurso.orden,
      })
    } else {
      setForm(defaultForm)
    }
    setError("")
  }, [recurso, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError("El título y el contenido son obligatorios.")
      return
    }

    setSaving(true)
    setError("")
    const supabase = createClient()

    try {
      const isEditing = !!recurso
      const payload: any = {
        tipo: form.tipo,
        categoria: form.tipo === "mensaje" ? form.categoria : null,
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        updated_at: new Date().toISOString(),
      }

      if (isEditing && recurso) {
        payload.orden = form.orden
        const { error: updateError } = await supabase
          .from("recursos")
          .update(payload)
          .eq("id", recurso.id)

        if (updateError) throw updateError
      } else {
        // Calculate next order sequence automatically
        let nextOrden = 0
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from("recursos")
          .select("orden")
          .eq("tipo", form.tipo)
          .order("orden", { ascending: false })
          .limit(1)

        if (!maxOrderError && maxOrderData && maxOrderData.length > 0) {
          nextOrden = maxOrderData[0].orden + 1
        }
        
        payload.orden = nextOrden
        const { error: insertError } = await supabase
          .from("recursos")
          .insert(payload)

        if (insertError) throw insertError
      }

      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el recurso.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            {recurso ? (
              <>
                <Edit className="w-4 h-4 text-violet-400" />
                Editar recurso
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-violet-400" />
                Nuevo recurso
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Tipo de recurso */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo de Recurso</Label>
            <Select
              value={form.tipo}
              onValueChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  tipo: v as TipoRecurso,
                  // Si no es mensaje, limpiamos la categoría
                  categoria: v === "mensaje" ? prev.categoria : "",
                }))
              }
              disabled={!!recurso} // No permitir cambiar el tipo al editar para evitar inconsistencias
            >
              <SelectTrigger className="bg-secondary border-border text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="mensaje">💬 Mensaje de venta</SelectItem>
                <SelectItem value="objecion">❌ Respuesta a objeción</SelectItem>
                <SelectItem value="caso_de_uso">🎯 Caso de uso</SelectItem>
                <SelectItem value="consejo">💡 Consejo de prospección</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoría (solo visible para mensajes) */}
          {form.tipo === "mensaje" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoría de Mensaje</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm((prev) => ({ ...prev, categoria: v }))}
              >
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="primer_contacto">Primer contacto</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  <SelectItem value="recontacto">Recontacto</SelectItem>
                  <SelectItem value="objecion">Respuesta a objeciones</SelectItem>
                  <SelectItem value="cierre">Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Título */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {form.tipo === "objecion" ? "Objeción (ej: 'Es muy caro')" : "Título del recurso"}
            </Label>
            <Input
              placeholder={
                form.tipo === "objecion"
                  ? "Ya tengo página web"
                  : form.tipo === "caso_de_uso"
                  ? "Psicólogos"
                  : "Ej: Mensaje inicial frío..."
              }
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              className="bg-secondary border-border text-sm h-9"
              required
            />
          </div>

          {/* Contenido */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {form.tipo === "objecion" ? "Respuesta sugerida" : "Contenido / Texto"}
            </Label>
            <Textarea
              placeholder={
                form.tipo === "mensaje"
                  ? "Escribe el mensaje listo para copiar... Usa [Nombre] como marcador de posición si aplica."
                  : "Detalla aquí la respuesta sugerida o recomendaciones..."
              }
              value={form.contenido}
              onChange={(e) => setForm((prev) => ({ ...prev, contenido: e.target.value }))}
              rows={6}
              className="bg-secondary border-border text-sm resize-none"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Footer actions */}
          <DialogFooter className="gap-2 pt-2">
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
              <FileText className="w-3.5 h-3.5 mr-2" />
              {saving ? "Guardando..." : recurso ? "Guardar cambios" : "Crear recurso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
