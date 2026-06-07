"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Bell, UserCheck, DollarSign, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/recordatorios", icon: Bell, label: "Recordatorios" },
  { href: "/clientes", icon: UserCheck, label: "Clientes" },
  { href: "/comisiones", icon: DollarSign, label: "Comisiones" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { usuarioNombre, signOut } = useAuth()

  return (
    <aside className="w-56 flex-shrink-0 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/30">
            P
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">AMwebs</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Gestión de leads</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-violet-600/20 text-violet-300 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  active ? "text-violet-400" : ""
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer - User info */}
      <div className="p-3 border-t border-border space-y-2">
        {/* User */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-xs font-semibold text-violet-300 flex-shrink-0">
            {usuarioNombre?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{usuarioNombre ?? "Usuario"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
