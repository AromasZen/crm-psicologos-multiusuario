"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, RefreshCw, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { estadoConfig, plataformaConfig, formatFecha, cn } from "@/lib/utils"
import type { Lead, EstadoLead } from "@/lib/types"
import { LeadSheet } from "./LeadSheet"
import { NewLeadModal } from "./NewLeadModal"
import { ImportExcel } from "./ImportExcel"

const PAGE_SIZE = 20

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState<EstadoLead | "todos">("todos")
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newLeadOpen, setNewLeadOpen] = useState(false)
  const [updatingEstado, setUpdatingEstado] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("fecha_ultimo_mensaje", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })

    if (search.trim()) {
      query = query.or(`nombre.ilike.%${search.trim()}%,numero.ilike.%${search.trim()}%`)
    }

    if (filterEstado !== "todos") {
      query = query.eq("estado", filterEstado)
    }

    const { data, count, error } = await query
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (!error) {
      setLeads((data as Lead[]) ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [search, filterEstado, page])

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300)
    return () => clearTimeout(timer)
  }, [fetchLeads])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [search, filterEstado])

  async function updateEstado(leadId: string, newEstado: EstadoLead) {
    setUpdatingEstado(leadId)
    const supabase = createClient()
    await supabase
      .from("leads")
      .update({ estado: newEstado, updated_at: new Date().toISOString() })
      .eq("id", leadId)
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, estado: newEstado } : l))
    )
    setUpdatingEstado(null)
  }

  function openSheet(lead: Lead) {
    setSelectedLead(lead)
    setSheetOpen(true)
  }

  function openWhatsApp(e: React.MouseEvent, numero: string) {
    e.stopPropagation()
    const clean = numero.replace(/\D/g, "")
    window.open(`https://wa.me/${clean}`, "_blank", "noopener,noreferrer")
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm h-9"
          />
        </div>

        {/* Estado filter */}
        <Select
          value={filterEstado}
          onValueChange={(v) => setFilterEstado(v as EstadoLead | "todos")}
        >
          <SelectTrigger className="w-44 bg-card border-border text-sm h-9">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="sin_respuesta">Sin respuesta</SelectItem>
            <SelectItem value="interesado">Interesado</SelectItem>
            <SelectItem value="seguimiento_pendiente">Seguimiento</SelectItem>
            <SelectItem value="demo_agendada">Demo agendada</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="no_interesado">No interesado</SelectItem>
          </SelectContent>
        </Select>

        <ImportExcel onImported={fetchLeads} />

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLeads}
          className="border-border text-muted-foreground hover:text-foreground h-9 w-9 p-0"
          title="Actualizar"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </Button>

        <Button
          size="sm"
          onClick={() => setNewLeadOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 gap-1.5 ml-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Nuevo lead
        </Button>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {loading ? "Cargando..." : `${total} lead${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground w-48">Nombre</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-36">Número</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-28">Plataforma</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-44">Estado</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-28">Último msg</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-border animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-border rounded w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                        🔍
                      </div>
                      <p>No se encontraron leads</p>
                      {search || filterEstado !== "todos" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSearch(""); setFilterEstado("todos") }}
                          className="border-border text-xs"
                        >
                          Limpiar filtros
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setNewLeadOpen(true)}
                          className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Agregar primer lead
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const plat = plataformaConfig[lead.plataforma]
                  const estado = estadoConfig[lead.estado]
                  return (
                    <TableRow
                      key={lead.id}
                      className="border-border cursor-pointer hover:bg-secondary/40 transition-colors group"
                      onClick={() => openSheet(lead)}
                    >
                      {/* Nombre */}
                      <TableCell className="font-medium text-sm text-foreground py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-xs font-semibold text-violet-300 flex-shrink-0">
                            {lead.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-32">{lead.nombre}</span>
                        </div>
                      </TableCell>

                      {/* Número */}
                      <TableCell className="text-xs text-muted-foreground font-mono py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{lead.numero}</span>
                          <button
                            onClick={(e) => openWhatsApp(e, lead.numero)}
                            title="Enviar mensaje por WhatsApp"
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5 leading-none flex-shrink-0"
                          >
                            <MessageCircle className="w-2.5 h-2.5" />
                            WSP
                          </button>
                        </div>
                      </TableCell>

                      {/* Plataforma */}
                      <TableCell className="py-3">
                        <span className={`text-xs font-medium ${plat.color}`}>
                          {plat.icon} {plat.label}
                        </span>
                      </TableCell>

                      {/* Estado — dropdown in-cell */}
                      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={lead.estado}
                          onValueChange={(v) => updateEstado(lead.id, v as EstadoLead)}
                          disabled={updatingEstado === lead.id}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-6 text-[11px] font-medium px-2 border rounded-full w-auto gap-1",
                              estado.color,
                              "bg-transparent hover:opacity-80"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border text-xs">
                            <SelectItem value="sin_respuesta">Sin respuesta</SelectItem>
                            <SelectItem value="interesado">Interesado</SelectItem>
                            <SelectItem value="seguimiento_pendiente">Seguimiento</SelectItem>
                            <SelectItem value="demo_agendada">Demo agendada</SelectItem>
                            <SelectItem value="cliente">Cliente ✓</SelectItem>
                            <SelectItem value="no_interesado">No interesado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Fecha último mensaje */}
                      <TableCell className="text-xs text-muted-foreground py-3">
                        {formatFecha(lead.fecha_ultimo_mensaje)}
                      </TableCell>

                      {/* Notas */}
                      <TableCell className="text-xs text-muted-foreground py-3 max-w-48">
                        <span className="line-clamp-1">{lead.notas || "—"}</span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card">
            <p className="text-xs text-muted-foreground">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-7 w-7 p-0 border-border"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-7 w-7 p-0 border-border"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Sheet */}
      <LeadSheet
        lead={selectedLead}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onLeadUpdated={fetchLeads}
      />

      {/* New Lead Modal */}
      <NewLeadModal
        open={newLeadOpen}
        onOpenChange={setNewLeadOpen}
        onCreated={fetchLeads}
      />
    </>
  )
}
