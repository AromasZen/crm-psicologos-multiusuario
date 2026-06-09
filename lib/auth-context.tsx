"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  usuarioId: string | null
  usuarioNombre: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  usuarioId: null,
  usuarioNombre: null,
  loading: false,
  login: async () => null,
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [usuarioNombre, setUsuarioNombre] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true)
    try {
      const supabase = createClient()

      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setLoading(false)
        return authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : authError.message
      }

      if (!authData.user) {
        setLoading(false)
        return "No se pudo iniciar sesión."
      }

      // 2. Fetch usuario from DB
      // Use .maybeSingle() to avoid 406 errors when no row is found
      const { data: dbUser, error: dbError } = await supabase
        .from("usuarios")
        .select("id, nombre")
        .eq("email", authData.user.email!)
        .maybeSingle()

      if (dbError) {
        console.error("Error buscando usuario:", dbError.message)
      }

      if (!dbUser) {
        await supabase.auth.signOut()
        setLoading(false)
        return "Tu cuenta no tiene acceso al sistema."
      }

      // 3. Set state — this is what unlocks the app
      setUser(authData.user)
      setUsuarioId(dbUser.id)
      setUsuarioNombre(dbUser.nombre)
      setLoading(false)
      return null // null = no error
    } catch {
      setLoading(false)
      return "Error de conexión. Intentá de nuevo."
    }
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setUsuarioId(null)
    setUsuarioNombre(null)
    // Fire and forget
    createClient().auth.signOut().catch(() => {})
  }, [])

  return (
    <AuthContext.Provider value={{ user, usuarioId, usuarioNombre, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
