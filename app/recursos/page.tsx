"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BookOpen,
  Search,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  HelpCircle,
  Info,
  Layers,
  Settings,
  MessageSquare,
  AlertCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { Recurso, TipoRecurso } from "@/lib/types"
import { RecursoModal } from "@/components/recursos/RecursoModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const TABS = [
  { id: "afiliado", label: "Centro de Recursos", icon: BookOpen },
  { id: "admin", label: "Administración", icon: Settings },
]

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
  const [activeTab, setActiveTab] = useState<"afiliado" | "admin">("afiliado")
  const [activeCategory, setActiveCategory] = useState<string>("mensaje")
  const [activeMsgCategory, setActiveMsgCategory] = useState<string>("primer_contacto")
  
  // Admin selected type to manage
  const [adminSelectedType, setAdminSelectedType] = useState<TipoRecurso>("mensaje")
  
  const [resources, setResources] = useState<Recurso[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [schemaError, setSchemaError] = useState(false)
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRecurso, setSelectedRecurso] = useState<Recurso | null>(null)

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
        // Check if table doesn't exist
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

  // Delete resource
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este recurso?")) return
    
    const supabase = createClient()
    const { error } = await supabase.from("recursos").delete().eq("id", id)
    
    if (error) {
      alert("Error al eliminar: " + error.message)
    } else {
      setResources((prev) => prev.filter((r) => r.id !== id))
    }
  }

  // Reordering handler
  const handleMove = async (index: number, direction: "up" | "down", list: Recurso[]) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    const currentItem = list[index]
    const targetItem = list[targetIndex]

    // Local swap for instantaneous feedback
    const originalCurrentOrder = currentItem.orden
    const originalTargetOrder = targetItem.orden

    // Update state locally
    setResources((prev) => {
      return prev.map((item) => {
        if (item.id === currentItem.id) return { ...item, orden: originalTargetOrder }
        if (item.id === targetItem.id) return { ...item, orden: originalCurrentOrder }
        return item
      }).sort((a, b) => a.orden - b.orden)
    })

    // Update in database
    const supabase = createClient()
    const { error: err1 } = await supabase
      .from("recursos")
      .update({ orden: originalTargetOrder })
      .eq("id", currentItem.id)
      
    const { error: err2 } = await supabase
      .from("recursos")
      .update({ orden: originalCurrentOrder })
      .eq("id", targetItem.id)

    if (err1 || err2) {
      console.error("Error updating order in database, refetching...", err1 || err2)
      fetchResources()
    }
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

  // Filtered resources for admin view (grouped by type)
  const adminFiltered = useMemo(() => {
    return resources.filter((r) => r.tipo === adminSelectedType)
  }, [resources, adminSelectedType])

  const openNewModal = () => {
    setSelectedRecurso(null)
    setModalOpen(true)
  }

  const openEditModal = (recurso: Recurso) => {
    setSelectedRecurso(recurso)
    setModalOpen(true)
  }

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

        {/* Admin/Affiliate Tabs */}
        {!schemaError && (
          <div className="flex bg-secondary p-1 rounded-lg border border-border self-start md:self-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as any)
                  setSearchQuery("")
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                  activeTab === id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}
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
                  // Copy path or file instructions
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
          {/* SEARCH BAR (Only visible / active in Affiliate View) */}
          {activeTab === "afiliado" && (
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
          )}

          {/* 1. VIEW MODE: AFFILIATE RESOURCES BOARD */}
          {activeTab === "afiliado" && (
            <>
              {searchQuery.trim() ? (
                // Search Results
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      Resultados de búsqueda ({affiliateFiltered.length})
                    </h2>
                  </div>
                  
                  {affiliateFiltered.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-card">
                      <p className="text-sm">No encontramos recursos para "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {affiliateFiltered.map((recurso) => (
                        <Card key={recurso.id} className="bg-card border-border hover:border-violet-500/20 transition-all duration-300">
                          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 gap-2">
                            <div>
                              <Badge className="mb-1.5 bg-violet-600/10 text-violet-400 border-violet-500/20 capitalize font-medium text-[10px]">
                                {recurso.tipo === "caso_de_uso" ? "Caso de uso" : recurso.tipo === "objecion" ? "Objeción" : recurso.tipo}
                              </Badge>
                              <CardTitle className="text-base font-bold text-foreground leading-tight">
                                {recurso.titulo}
                              </CardTitle>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(recurso.contenido, recurso.id)}
                              className="border-border text-muted-foreground hover:text-foreground h-8 px-2 flex-shrink-0"
                            >
                              {copiedId === recurso.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {recurso.contenido}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Categorized Layout
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  {/* Category selector sidebar */}
                  <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                    {CATEGORIES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => {
                          setActiveCategory(id)
                          // Si es mensaje, reiniciamos la subcategoría en primer_contacto
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
                    {/* Specific category details & nested categories */}
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
                        <p className="text-xs text-muted-foreground mt-1">Los administradores pueden agregar recursos en la pestaña "Administración".</p>
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
              )}
            </>
          )}

          {/* 2. ADMIN MODE: RESOURCE ADMINISTRATION PANEL */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              {/* Admin Selector & Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Module switcher */}
                <div className="flex bg-card p-1 rounded-xl border border-border max-w-md overflow-x-auto scrollbar-none gap-1">
                  {CATEGORIES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setAdminSelectedType(id as TipoRecurso)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex-shrink-0 ${
                        adminSelectedType === id
                          ? "bg-secondary text-foreground border border-border shadow-inner"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={openNewModal}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 gap-1.5 font-semibold self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Recurso
                </Button>
              </div>

              {/* Admin items list */}
              {adminFiltered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
                  <p className="text-sm font-medium">No hay recursos creados para este módulo.</p>
                  <Button
                    variant="outline"
                    onClick={openNewModal}
                    className="border-border text-xs mt-3 h-8"
                  >
                    Crear el primero
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                          <th className="px-5 py-3.5 w-16">Orden</th>
                          <th className="px-5 py-3.5 w-56">Título</th>
                          {adminSelectedType === "mensaje" && (
                            <th className="px-5 py-3.5 w-36">Categoría</th>
                          )}
                          <th className="px-5 py-3.5">Contenido</th>
                          <th className="px-5 py-3.5 w-40 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminFiltered.map((recurso, index) => (
                          <tr
                            key={recurso.id}
                            className="border-b border-border hover:bg-secondary/20 transition-colors text-xs text-foreground"
                          >
                            {/* Order arrows */}
                            <td className="px-5 py-3.5 font-mono text-center">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold w-3.5 text-center text-muted-foreground">
                                  {index + 1}
                                </span>
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => handleMove(index, "up", adminFiltered)}
                                    disabled={index === 0}
                                    title="Subir orden"
                                    className={`p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent`}
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMove(index, "down", adminFiltered)}
                                    disabled={index === adminFiltered.length - 1}
                                    title="Bajar orden"
                                    className={`p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent`}
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Title */}
                            <td className="px-5 py-3.5 font-semibold max-w-[200px] truncate">
                              {recurso.titulo}
                            </td>

                            {/* Category (only messages) */}
                            {adminSelectedType === "mensaje" && (
                              <td className="px-5 py-3.5 text-muted-foreground">
                                <Badge variant="outline" className="text-[10px] bg-secondary/50 font-normal">
                                  {MSG_CATEGORIES.find((c) => c.id === recurso.categoria)?.label || recurso.categoria}
                                </Badge>
                              </td>
                            )}

                            {/* Content */}
                            <td className="px-5 py-3.5 text-muted-foreground max-w-sm truncate font-normal">
                              {recurso.contenido}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(recurso)}
                                  className="border-border text-muted-foreground hover:text-foreground h-7 px-2"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(recurso.id)}
                                  className="border-border text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading state indicator */}
      {!schemaError && loading && (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">Cargando recursos del servidor...</p>
        </div>
      )}

      {/* Custom RecursoModal */}
      <RecursoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={fetchResources}
        recurso={selectedRecurso}
      />
    </div>
  )
}
