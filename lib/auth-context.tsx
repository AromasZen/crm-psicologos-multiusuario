"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  usuarioId: string | null
  usuarioNombre: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  usuarioId: null,
  usuarioNombre: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [usuarioNombre, setUsuarioNombre] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUsuario = useCallback(async (email: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("email", email)
      .eq("activo", true)
      .single()

    if (!error && data) {
      setUsuarioId(data.id)
      setUsuarioNombre(data.nombre)
    } else {
      // User exists in auth but not in usuarios table or is inactive
      setUsuarioId(null)
      setUsuarioNombre(null)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchUsuario(session.user.email!)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUsuario(session.user.email!)
        } else {
          setUser(null)
          setUsuarioId(null)
          setUsuarioNombre(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUsuario])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUsuarioId(null)
    setUsuarioNombre(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, usuarioId, usuarioNombre, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
