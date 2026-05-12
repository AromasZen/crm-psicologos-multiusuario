import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { EstadoLead, Plataforma } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const estadoConfig: Record<
  EstadoLead,
  { label: string; color: string }
> = {
  sin_respuesta: { label: "Sin respuesta", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  interesado: { label: "Interesado", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  no_interesado: { label: "No interesado", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  demo_agendada: { label: "Demo agendada", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  cliente: { label: "Cliente ✓", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  seguimiento_pendiente: { label: "Seguimiento", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
}

export const plataformaConfig: Record<
  Plataforma,
  { label: string; icon: string; color: string }
> = {
  whatsapp: { label: "WhatsApp", icon: "💬", color: "text-emerald-400" },
  instagram: { label: "Instagram", icon: "📸", color: "text-pink-400" },
  email: { label: "Email", icon: "✉️", color: "text-blue-400" },
  otro: { label: "Otro", icon: "📌", color: "text-slate-400" },
}

export function formatFecha(fecha: string | null): string {
  if (!fecha) return "—"
  const d = new Date(fecha)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Hoy"
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
}

export function formatFechaCompleta(fecha: string | null): string {
  if (!fecha) return "—"
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
