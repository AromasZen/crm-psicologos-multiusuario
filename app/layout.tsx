import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthShell } from "@/components/AuthShell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CRM Psicólogos — Panel de Prospección",
  description: "Gestión de leads y seguimiento de prospectos para la venta del sistema de turnos para psicólogos.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  )
}
