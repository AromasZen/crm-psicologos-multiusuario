"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Layers,
  MessageSquare,
  AlertCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { Recurso } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const CATEGORIES = [
  { id: "mensaje", label: "Mensajes de Venta", icon: MessageSquare },
  { id: "objecion", label: "Respuestas a Objeciones", icon: HelpCircle },
  { id: "caso_de_uso", label: "Casos de Uso", icon: Layers },
  { id: "consejo", label: "Consejos Prácticos", icon: Sparkles },
]

const MSG_CATEGORIES = [
  { id: "primer_contacto", label: "Primer contacto" },
  { id: "seguimiento", label: "Seguimiento" },
  { id: "recontacto", label: "Recontacto" },
  { id: "objecion", label: "Respuesta a objeciones" },
  { id: "cierre", label: "Cierre" },
]

export default function RecursosPage() {
  const [activeCategory, setActiveCategory] = useState<string>("mensaje")
  const [activeMsgCategory, setActiveMsgCategory] = useState<string>("primer_contacto")
  
  const [resources, setResources] = useState<Recurso[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [schemaError, setSchemaError] = useState(false)

  // Fetch resources from Supabase
  const fetchResources = async () => {
    setLoading(true)
    setErrorMsg("")
    setSchemaError(false)
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from("recursos")
        .select("*")
        .order("orden", { ascending: true })

      if (error) {
        if (error.message?.includes("relation") && error.message?.includes("does not exist") || error.code === "PGRST116" || error.message?.includes("schema cache")) {
          setSchemaError(true)
        } else {
          setErrorMsg(error.message)
        }
      } else if (data) {
        setResources(data)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con la base de datos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  // Clipboard copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered resources for the affiliate view
  const affiliateFiltered = useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      return resources.filter(
        (r) =>
          r.titulo.toLowerCase().includes(query) ||
          r.contenido.toLowerCase().includes(query)
      )
    }

    return resources.filter((r) => {
      if (r.tipo !== activeCategory) return false
      if (activeCategory === "mensaje") {
        return r.categoria === activeMsgCategory
      }
      return true
    })
  }, [resources, activeCategory, activeMsgCategory, searchQuery])

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-violet-500" />
            Centro de Recursos Comerciales
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Materiales de ventas, respuestas a objeciones, mensajes listos y consejos prácticos para afiliados.
          </p>
        </div>
      </div>

      {/* Database Schema Warning - Interactive helper */}
      {schemaError && (
        <Card className="border-amber-600/30 bg-amber-950/10 text-amber-200">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Base de Datos Requerida: Crear Tabla de Recursos
            </CardTitle>
            <CardDescription className="text-amber-300/80">
              Para habilitar esta sección, debes crear la tabla <code className="bg-amber-950/40 px-1 rounded text-amber-200">recursos</code> en tu consola de Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs">
              Sigue estos pasos rápidos:
            </p>
            <ol className="list-decimal list-inside text-xs space-y-1.5 pl-1">
              <li>Inicia sesión en tu panel de Supabase.</li>
              <li>Ingresa al menú del <strong>SQL Editor</strong> en la barra lateral izquierda.</li>
              <li>Haz clic en <strong>New Query</strong> (Nueva consulta).</li>
              <li>Abre y copia el código del archivo <code className="bg-amber-950/40 px-1.5 py-0.5 rounded font-mono text-white">supabase_schema.sql</code> que hemos creado en la raíz de tu proyecto.</li>
              <li>Pega el código en el editor y presiona el botón <strong>Run</strong> (Ejecutar).</li>
            </ol>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const path = "supabase_schema.sql"
                  navigator.clipboard.writeText(path)
                  alert("Ruta del archivo copiada al portapapeles: supabase_schema.sql")
                }}
                className="border-amber-600/40 text-amber-200 hover:bg-amber-600/20 text-xs h-8"
              >
                Copiar ruta del script
              </Button>
              <Button
                size="sm"
                onClick={fetchResources}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
              >
                Ya lo ejecuté, verificar conexión
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Area */}
      {!schemaError && !loading && (
        <div className="space-y-6">
          {/* SEARCH BAR */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mensajes, objeciones, consejos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-sm h-10 w-full rounded-xl shadow-sm focus-visible:ring-violet-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Categorized Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Category selector sidebar */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveCategory(id)
                    if (id === "mensaje") setActiveMsgCategory("primer_contacto")
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-300 flex-shrink-0 text-left w-auto lg:w-full ${
                    activeCategory === id
                      ? "bg-violet-600/10 border-violet-500/30 text-violet-300 shadow-sm shadow-violet-500/5"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeCategory === id ? "text-violet-400" : ""}`} />
                  {label}
                </button>
              ))}
            </div>

            {/* Main Category Display Grid */}
            <div className="lg:col-span-3 space-y-6">
              {activeCategory === "mensaje" && (
                <div className="flex bg-card p-1 rounded-xl border border-border overflow-x-auto scrollbar-none gap-1">
                  {MSG_CATEGORIES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setActiveMsgCategory(id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
                        activeMsgCategory === id
                          ? "bg-secondary text-foreground font-semibold border border-border shadow-inner"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Resources list */}
              {affiliateFiltered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl mx-auto mb-3">
                    📂
                  </div>
                  <p className="text-sm font-medium">Aún no hay recursos cargados aquí</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {affiliateFiltered.map((recurso) => (
                    <Card key={recurso.id} className="bg-card border-border hover:border-violet-500/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 gap-2">
                        <CardTitle className="text-sm font-bold text-foreground leading-tight">
                          {recurso.titulo}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(recurso.contenido, recurso.id)}
                          className="border-border text-muted-foreground hover:text-foreground h-8 px-2 flex-shrink-0 relative active:scale-95 transition-transform"
                          title="Copiar al portapapeles"
                        >
                          {copiedId === recurso.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">¡Copiado!</span>
                            </>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-1 flex-1">
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed select-all">
                          {recurso.contenido}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {!schemaError && loading && (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">Cargando recursos del servidor...</p>
        </div>
      )}
    </div>
  )
}
