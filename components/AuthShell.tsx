"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/Sidebar"
import { Loader2 } from "lucide-react"
import { LoginForm } from "@/components/LoginForm"

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, usuarioId, loading } = useAuth()

  // Show login if not authenticated (loading starts as false, so this shows immediately)
  if (!user || !usuarioId) {
    return <LoginForm />
  }

  // Show spinner only during login process
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </AuthProvider>
  )
}
