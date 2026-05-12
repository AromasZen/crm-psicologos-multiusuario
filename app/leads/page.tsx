import { LeadsTable } from "@/components/leads/LeadsTable"

export default function LeadsPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Gestión de Leads
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administrá tus prospectos, registrá mensajes y programá recordatorios.
        </p>
      </div>

      {/* Table */}
      <section>
        <LeadsTable />
      </section>
    </div>
  )
}
