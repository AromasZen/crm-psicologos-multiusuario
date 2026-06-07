"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Comision } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DollarSign, RefreshCw, CheckCircle, Clock } from "lucide-react"
import { cn, formatFecha } from "@/lib/utils"

export function ComisionesList() {
  const { usuarioId } = useAuth()
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"pendientes" | "pagadas" | "todas">("pendientes")

  const fetchComisiones = useCallback(async () => {
    if (!usuarioId) return
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("comisiones")
      .select("*, clientes(nombre)")
      .eq("usuario_id", usuarioId)
      .order("fecha_generada", { ascending: false })

    if (filter === "pendientes") {
      query = query.eq("pagada", false)
    } else if (filter === "pagadas") {
      query = query.eq("pagada", true)
    }

    const { data, error } = await query
    if (!error && data) {
      setComisiones(data as Comision[])
    }
    setLoading(false)
  }, [usuarioId, filter])

  useEffect(() => {
    fetchComisiones()
  }, [fetchComisiones])

  function formatPesos(n: number) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(n)
  }

  const totalPendiente = comisiones
    .filter((c) => !c.pagada)
    .reduce((acc, c) => acc + c.monto, 0)

  const totalPagado = comisiones
    .filter((c) => c.pagada)
    .reduce((acc, c) => acc + c.monto, 0)

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-amber-600/20 bg-gradient-to-br from-amber-600/15 to-amber-700/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-300 font-medium">Pendientes de cobro</span>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {loading ? "..." : formatPesos(totalPendiente)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-600/20 bg-gradient-to-br from-emerald-600/15 to-emerald-700/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium">Total cobrado</span>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {loading ? "..." : formatPesos(totalPagado)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {(["pendientes", "pagadas", "todas"] as const).map((f) => (
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

        <Button
          variant="outline"
          size="sm"
          onClick={fetchComisiones}
          className="h-8 border-border text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 mr-2", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Monto</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Fecha Generada</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Fecha Pagada</TableHead>
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
            ) : comisiones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <DollarSign className="w-10 h-10 text-muted-foreground/20" />
                    <p>No hay comisiones {filter === "todas" ? "" : filter}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              comisiones.map((com) => (
                <TableRow key={com.id} className="border-border hover:bg-secondary/40 transition-colors">
                  <TableCell className="font-medium text-sm text-foreground py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-xs font-semibold text-violet-300 flex-shrink-0">
                        {com.clientes?.nombre?.charAt(0).toUpperCase() ?? "$"}
                      </div>
                      {com.clientes?.nombre ?? "Cliente"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums py-3">
                    <span className={com.pagada ? "text-emerald-400" : "text-amber-400"}>
                      {formatPesos(com.monto)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full border font-medium",
                      com.pagada
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    )}>
                      {com.pagada ? "Pagada ✓" : "Pendiente"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3">
                    {formatFecha(com.fecha_generada)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3">
                    {com.fecha_pagada ? formatFecha(com.fecha_pagada) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
