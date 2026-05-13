"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Upload, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { Plataforma, EstadoLead } from "@/lib/types"

interface ImportExcelProps {
  onImported: () => void
}

interface ImportResult {
  inserted: number
  skipped: number
  errors: number
}

export function ImportExcel({ onImported }: ImportExcelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setResult(null)

    try {
      const XLSX = await import("xlsx")
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" })

      const supabase = createClient()
      let inserted = 0
      let skipped = 0
      let errors = 0

      for (const row of rows) {
        const nombre = String(row.nombre || row.Nombre || "").trim()
        const numero = String(row.numero || row.Numero || row.número || "").trim()
        const plataforma = (String(row.plataforma || row.Plataforma || "").toLowerCase().trim() ||
          "otro") as Plataforma
        const notas = String(row.notas || row.Notas || "").trim()

        if (!nombre || !numero) {
          errors++
          continue
        }

        const validPlatformas: Plataforma[] = ["whatsapp", "instagram", "email", "otro"]
        const plataformaFinal: Plataforma = validPlatformas.includes(plataforma)
          ? plataforma
          : "otro"

        // Check duplicate
        const { data: existing } = await supabase
          .from("leads")
          .select("id")
          .eq("numero", numero)
          .single()

        if (existing) {
          skipped++
          continue
        }

        const { error } = await supabase.from("leads").insert({
          nombre,
          numero,
          plataforma: plataformaFinal,
          estado: "sin_respuesta" as EstadoLead,
          notas: notas || null,
          fecha_contacto: new Date().toISOString(),
          fecha_ultimo_mensaje: null,
        })

        if (error) {
          errors++
        } else {
          inserted++
        }
      }

      setResult({ inserted, skipped, errors })
      if (inserted > 0) onImported()
    } catch (err) {
      console.error(err)
      setResult({ inserted: 0, skipped: 0, errors: 1 })
    }

    setLoading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="border-border text-muted-foreground hover:text-foreground text-xs h-8 gap-1.5"
      >
        {loading ? (
          <>
            <Upload className="w-3.5 h-3.5 animate-bounce" />
            Importando...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Importar Excel
          </>
        )}
      </Button>

      {result && (
        <div className="flex items-center gap-2 text-xs">
          {result.inserted > 0 && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              {result.inserted} importados
            </span>
          )}
          {result.skipped > 0 && (
            <span className="text-muted-foreground">{result.skipped} duplicados</span>
          )}
          {result.errors > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <XCircle className="w-3 h-3" />
              {result.errors} errores
            </span>
          )}
        </div>
      )}
    </div>
  )
}
