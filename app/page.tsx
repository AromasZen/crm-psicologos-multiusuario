import { MetricsCards } from "@/components/dashboard/MetricsCards"
import { PendingFollowups } from "@/components/dashboard/PendingFollowups"
import { LeadsChart } from "@/components/dashboard/LeadsChart"

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

      {/* Followups + Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingFollowups />
        <LeadsChart />
      </section>
    </div>
  )
}
