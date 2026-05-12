import { MetricsCards } from "@/components/dashboard/MetricsCards"
import { PendingFollowups } from "@/components/dashboard/PendingFollowups"

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen general de tu prospección y estado de leads.
        </p>
      </div>

      {/* Metrics */}
      <section>
        <MetricsCards />
      </section>

      {/* Followups */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingFollowups />
        
        {/* Placeholder for future charts or activity feed */}
        <div className="rounded-xl border border-border bg-card/50 flex flex-col items-center justify-center p-8 text-center border-dashed">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <span className="text-xl">📊</span>
          </div>
          <h3 className="text-sm font-medium text-foreground">Más métricas pronto</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Aquí se mostrarán gráficos de conversión y actividad semanal en futuras actualizaciones.
          </p>
        </div>
      </section>
    </div>
  )
}
