import { ComisionesList } from "@/components/comisiones/ComisionesList"

export default function ComisionesPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Comisiones
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualizá tus comisiones generadas y su estado de pago.
        </p>
      </div>

      <section>
        <ComisionesList />
      </section>
    </div>
  )
}
