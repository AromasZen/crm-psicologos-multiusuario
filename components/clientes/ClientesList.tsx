"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Cliente } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserCheck, Plus, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react"
import { cn, formatFecha } from "@/lib/utils"

export function ClientesList() {
  const { usuarioId } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"activos" | "inactivos" | "todos">("activos")
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form for new client
  const [leads, setLeads] = useState<{ id: string; nombre: string }[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState("")
  const [nombre, setNombre] = useState("")
  const [mensualidad, setMensualidad] = useState("")

  const fetchClientes = useCallback(async () => {
    if (!usuarioId) return
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("clientes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("fecha_alta", { ascending: false })

    if (filter === "activos") {
      query = query.eq("activo", true)
    } else if (filter === "inactivos") {
      query = query.eq("activo", false)
    }

    const { data, error } = await query
    if (!error && data) {
      setClientes(data as Cliente[])
    }
    setLoading(false)
  }, [usuarioId, filter])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  // Fetch leads with estado "cliente" for the new client modal
  async function fetchLeadsCliente() {
    if (!usuarioId) return
    const supabase = createClient()
    const { data } = await supabase
      .from("leads")
      .select("id, nombre")
      .eq("usuario_id", usuarioId)
      .eq("estado", "cliente")
      .order("nombre")

    if (data) setLeads(data)
  }

  function openNewClient() {
    fetchLeadsCliente()
    setSelectedLeadId("")
    setNombre("")
    setMensualidad("")
    setShowModal(true)
  }

  async function handleCreate() {
    if (!usuarioId || !nombre.trim() || !mensualidad) return
    setSaving(true)
    const supabase = createClient()

    const montoNum = parseFloat(mensualidad)
    if (isNaN(montoNum) || montoNum < 0) {
      setSaving(false)
      return
    }

    const { error } = await supabase.from("clientes").insert({
      usuario_id: usuarioId,
      lead_id: selectedLeadId || null,
      nombre: nombre.trim(),
      mensualidad: montoNum,
      activo: true,
      fecha_alta: new Date().toISOString().split("T")[0],
    })

    if (!error) {
      setShowModal(false)
      fetchClientes()
    }
    setSaving(false)
  }

  async function toggleActivo(id: string, currentState: boolean) {
    const supabase = createClient()
    await supabase
      .from("clientes")
      .update({ activo: !currentState })
      .eq("id", id)
    fetchClientes()
  }

  function formatPesos(n: number) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(n)
  }

  const totalMensual = clientes
    .filter((c) => c.activo)
    .reduce((acc, c) => acc + c.mensualidad, 0)

  return (
    <div className="space-y-4">
      {/* Summary + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {(["activos", "inactivos", "todos"] as const).map((f) => (
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
        </div>

        <div className="flex items-center gap-3">
          {/* Total mensual */}
          <div className="text-xs text-muted-foreground">
            Ingreso mensual:{" "}
            <span className="text-emerald-400 font-semibold">{formatPesos(totalMensual)}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchClientes}
            className="h-8 border-border text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-2", loading && "animate-spin")} />
            Actualizar
          </Button>

          <Button
            size="sm"
            onClick={openNewClient}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo cliente
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Mensualidad</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Fecha Alta</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-border rounded w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <UserCheck className="w-10 h-10 text-muted-foreground/20" />
                    <p>No hay clientes {filter === "todos" ? "" : filter}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((cliente) => (
                <TableRow key={cliente.id} className="border-border hover:bg-secondary/40 transition-colors">
                  <TableCell className="font-medium text-sm text-foreground py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-600/20 flex items-center justify-center text-xs font-semibold text-amber-300 flex-shrink-0">
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </div>
                      {cliente.nombre}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-emerald-400 font-semibold tabular-nums py-3">
                    {formatPesos(cliente.mensualidad)}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full border font-medium",
                      cliente.activo
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                    )}>
                      {cliente.activo ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3">
                    {formatFecha(cliente.fecha_alta)}
                  </TableCell>
                  <TableCell className="py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActivo(cliente.id, cliente.activo)}
                      className={cn(
                        "h-7 text-xs border-border",
                        cliente.activo
                          ? "text-muted-foreground hover:text-red-400 hover:border-red-500/30"
                          : "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20"
                      )}
                    >
                      {cliente.activo ? (
                        <><ToggleRight className="w-3.5 h-3.5 mr-1" />Desactivar</>
                      ) : (
                        <><ToggleLeft className="w-3.5 h-3.5 mr-1" />Activar</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Client Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Nuevo cliente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Lead asociado */}
            {leads.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Lead asociado (opcional)</Label>
                <Select value={selectedLeadId} onValueChange={(v) => {
                  setSelectedLeadId(v)
                  // Auto-fill name from lead
                  const lead = leads.find((l) => l.id === v)
                  if (lead && !nombre.trim()) setNombre(lead.nombre)
                }}>
                  <SelectTrigger className="bg-secondary border-border text-sm h-9">
                    <SelectValue placeholder="Seleccionar lead..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre *</Label>
              <Input
                placeholder="Nombre del cliente"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="bg-secondary border-border text-sm h-9"
              />
            </div>

            {/* Mensualidad */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mensualidad (ARS $)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={mensualidad}
                  onChange={(e) => setMensualidad(e.target.value)}
                  min="0"
                  className="bg-secondary border-border text-sm h-9 pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="border-border text-muted-foreground text-sm h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !nombre.trim() || !mensualidad}
              className="bg-amber-600 hover:bg-amber-700 text-white text-sm h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              {saving ? "Creando..." : "Crear cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
