"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Loader2, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : authError.message
      )
      setLoading(false)
    }
    // If successful, AuthProvider will detect the session change
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-fuchsia-600/6 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-600/5 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-xl font-bold shadow-2xl shadow-violet-500/30 mb-4">
            P
          </div>
          <h1 className="text-xl font-bold text-foreground">AMwebs CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de leads y prospectos</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-sm p-6 shadow-2xl shadow-black/20">
          <h2 className="text-base font-semibold text-foreground mb-1">Iniciar sesión</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Ingresá con tu cuenta para acceder al panel.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/40 transition-all duration-150"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/40 transition-all duration-150"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          Sistema de turnos para psicólogos · AMwebs
        </p>
      </div>
    </div>
  )
}
