// lib/types.ts

export type Plataforma = 'whatsapp' | 'instagram' | 'email' | 'otro'
export type EstadoLead =
  | 'sin_respuesta'
  | 'interesado'
  | 'no_interesado'
  | 'demo_agendada'
  | 'cliente'
  | 'seguimiento_pendiente'

export interface Lead {
  id: string
  nombre: string
  numero: string
  plataforma: Plataforma
  estado: EstadoLead
  fecha_contacto: string | null
  fecha_ultimo_mensaje: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Mensaje {
  id: string
  lead_id: string
  fecha: string
  tipo: 'enviado' | 'recibido'
  contenido: string
  created_at: string
}

export interface Recordatorio {
  id: string
  lead_id: string
  fecha_recordatorio: string
  descripcion: string
  completado: boolean
  created_at: string
  leads?: Pick<Lead, 'nombre' | 'numero' | 'plataforma'>
}

export interface DashboardMetrics {
  total: number
  sin_respuesta: number
  interesados: number
  demos_agendadas: number
  clientes: number
  no_interesados: number
}
