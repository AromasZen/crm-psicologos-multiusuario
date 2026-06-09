// lib/types.ts

export type Plataforma = 'whatsapp' | 'instagram' | 'email' | 'otro'

export type EstadoLead =
  | 'sin_respuesta'
  | 'seguimiento'
  | 'interesado'
  | 'pasado_a_agustin'
  | 'cliente'
  | 'no_interesado'

export interface Usuario {
  id: string
  nombre: string
  email: string
  activo: boolean
  created_at: string
}

export interface Lead {
  id: string
  usuario_id: string
  nombre: string
  numero: string
  plataforma: Plataforma
  fuente: string | null
  estado: EstadoLead
  fecha_contacto: string | null
  fecha_ultimo_mensaje: string | null
  notas: string | null
  created_at: string
  updated_at: string
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
  seguimiento: number
  interesados: number
  pasado_a_agustin: number
  clientes: number
  no_interesados: number
}

export type TipoRecurso = 'mensaje' | 'objecion' | 'caso_de_uso' | 'consejo'

export interface Recurso {
  id: string
  tipo: TipoRecurso
  categoria: string | null // e.g., 'primer_contacto', 'seguimiento', 'recontacto', 'objecion', 'cierre' (used for tipo === 'mensaje')
  titulo: string
  contenido: string
  orden: number
  created_at: string
  updated_at: string
}

