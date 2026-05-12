import { RecordatoriosList } from "@/components/recordatorios/RecordatoriosList"

export default function RecordatoriosPage() {
  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Recordatorios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná todos los seguimientos y recordatorios programados.
        </p>
      </div>

      <section>
        <RecordatoriosList />
      </section>
    </div>
  )
}
