"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { DollarSign, Plus, Trash2, TrophyIcon, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface SaleEntry {
  id: string
  descripcion: string
  monto: number
  fecha: string
  created_at: string
}

const META = 10_000_000

function formatPesos(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n)
}

export function RevenueGoal() {
  const [ventas, setVentas] = useState<SaleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [desc, setDesc] = useState("")
  const [monto, setMonto] = useState("")
  const [animatedPct, setAnimatedPct] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)

  const fetchVentas = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("ventas_meta")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setVentas(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas])

  const total = ventas.reduce((acc, v) => acc + v.monto, 0)
  const pct = Math.min((total / META) * 100, 100)

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedPct(pct), 100)
    return () => clearTimeout(timeout)
  }, [pct])

  async function handleAdd() {
    const montoNum = parseFloat(monto.replace(/\./g, "").replace(",", "."))
    if (!desc.trim() || isNaN(montoNum) || montoNum <= 0) return

    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("ventas_meta")
      .insert({
        descripcion: desc.trim(),
        monto: montoNum,
        fecha: new Date().toISOString(),
      })
      .select()
      .single()

    if (!error && data) {
      setVentas((prev) => [data, ...prev])
    }
    setDesc("")
    setMonto("")
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("ventas_meta").delete().eq("id", id)
    if (!error) {
      setVentas((prev) => prev.filter((v) => v.id !== id))
    }
  }

  const remaining = Math.max(META - total, 0)
  const isComplete = total >= META

  const barColor =
    pct >= 80
      ? "from-emerald-400 via-emerald-500 to-teal-400"
      : pct >= 50
      ? "from-violet-500 via-purple-500 to-indigo-400"
      : "from-violet-600 via-fuchsia-500 to-pink-500"

  const glowColor =
    pct >= 80
      ? "shadow-emerald-500/40"
      : pct >= 50
      ? "shadow-violet-500/40"
      : "shadow-fuchsia-500/40"

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-sm">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-fuchsia-600/10 blur-2xl" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 border border-violet-500/20">
              {isComplete ? (
                <TrophyIcon className="h-5 w-5 text-amber-400" />
              ) : (
                <DollarSign className="h-5 w-5 text-violet-400" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground/90">Meta de ingresos</h2>
              <p className="text-xs text-muted-foreground">Objetivo: {formatPesos(META)}</p>
            </div>
          </div>
          <button
            id="revenue-goal-add-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/25 px-3 py-1.5 text-xs font-medium text-violet-300 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar venta
          </button>
        </div>

        {/* Amount */}
        <div className="relative mb-4">
          <div className="flex items-end justify-between mb-1">
            <div>
              {loading ? (
                <div className="h-9 w-48 rounded-lg bg-white/[0.06] animate-pulse" />
              ) : (
                <span className="text-3xl font-bold tabular-nums text-foreground">
                  {formatPesos(total)}
                </span>
              )}
              {isComplete && !loading && (
                <span className="ml-2 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  ¡Meta alcanzada! 🎉
                </span>
              )}
            </div>
            {!loading && (
              <span className="text-2xl font-bold tabular-nums text-muted-foreground/60">
                {pct.toFixed(1)}%
              </span>
            )}
          </div>
          {!isComplete && !loading && (
            <p className="text-xs text-muted-foreground">
              Faltan{" "}
              <span className="text-foreground/70 font-medium">{formatPesos(remaining)}</span>{" "}
              para llegar a la meta
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative mb-4">
          <div className="h-5 w-full overflow-hidden rounded-full bg-white/[0.06] border border-white/[0.04]">
            <div
              ref={barRef}
              style={{ width: loading ? "0%" : `${animatedPct}%` }}
              className={`h-full rounded-full bg-gradient-to-r ${barColor} shadow-lg ${glowColor} transition-all duration-1000 ease-out relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
            </div>
          </div>
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              style={{ left: `${mark}%` }}
              className="absolute top-0 h-5 w-px bg-white/10"
            />
          ))}
        </div>

        {/* Milestone pills */}
        <div className="flex gap-2 mb-5">
          {[
            { label: "25%", val: 25, amount: META * 0.25 },
            { label: "50%", val: 50, amount: META * 0.5 },
            { label: "75%", val: 75, amount: META * 0.75 },
            { label: "100%", val: 100, amount: META },
          ].map(({ label, val, amount }) => {
            const reached = !loading && pct >= val
            return (
              <div
                key={label}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all duration-500 ${
                  reached
                    ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                    : "bg-white/[0.03] border-white/[0.05] text-muted-foreground/50"
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${reached ? "bg-violet-400" : "bg-white/20"}`}
                />
                {label}
                <span className="hidden sm:inline text-[9px] opacity-60">
                  · {formatPesos(amount)}
                </span>
              </div>
            )
          })}
        </div>

        {/* History toggle */}
        {!loading && ventas.length > 0 && (
          <div>
            <button
              id="revenue-goal-history-toggle"
              onClick={() => setShowHistory((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all duration-200"
            >
              <span className="font-medium">Historial de ventas ({ventas.length})</span>
              {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showHistory && (
              <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {ventas.map((v) => (
                  <div
                    key={v.id}
                    className="group flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2 hover:bg-white/[0.06] transition-colors duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground/80 truncate">{v.descripcion}</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(v.fecha).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400 tabular-nums whitespace-nowrap">
                      +{formatPesos(v.monto)}
                    </span>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-red-400 transition-all duration-150 flex-shrink-0"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#111118] shadow-2xl shadow-black/50 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                  <Plus className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Nueva venta</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Descripción
                </label>
                <input
                  id="revenue-modal-desc"
                  type="text"
                  placeholder="Ej: Página web para consultorio..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/40 transition-all duration-150"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Monto (ARS $)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input
                    id="revenue-modal-amount"
                    type="number"
                    placeholder="0"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    min="0"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/40 transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <button
                id="revenue-modal-confirm"
                onClick={handleAdd}
                disabled={saving || !desc.trim() || !monto || parseFloat(monto) <= 0}
                className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Agregar venta"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  )
}
