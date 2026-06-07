import { ClientesList } from "@/components/clientes/ClientesList"

export default function ClientesPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Clientes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná tus clientes activos y su información de facturación.
        </p>
      </div>

      <section>
        <ClientesList />
      </section>
    </div>
  )
}
