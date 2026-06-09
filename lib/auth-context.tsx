"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

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
      return data
    }
    return null
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function handleAuth(session: Session | null) {
      if (session?.user) {
        if (active) setUser(session.user)
        const dbUser = await fetchUsuario(session.user.email!)
        if (active) {
          if (dbUser) {
            setUsuarioId(dbUser.id)
            setUsuarioNombre(dbUser.nombre)
          } else {
            setUsuarioId(null)
            setUsuarioNombre(null)
          }
        }
      } else {
        if (active) {
          setUser(null)
          setUsuarioId(null)
          setUsuarioNombre(null)
        }
      }
      if (active) setLoading(false)
    }

    // Check initial session — Supabase SSR persists the session automatically
    // via cookies, so getSession() restores it on page refresh
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      handleAuth(session)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        await handleAuth(session)
      }
    )

    return () => {
      active = false
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
