"use client"

import type React from "react"

import { useState } from "react"
import { Download, Upload, FileJson, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export function DataManager() {
  const { exportData, importData } = useStore()
  const { toast } = useToast()
  const [importOpen, setImportOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = () => {
    try {
      const data = exportData()
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `subscriptions-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportación exitosa",
        description: "Sus datos han sido descargados correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        // Validate data structure
        if (!data.currencies || !Array.isArray(data.currencies)) {
          throw new Error("Formato inválido: falta el array de monedas")
        }
        if (!data.subscriptions || !Array.isArray(data.subscriptions)) {
          throw new Error("Formato inválido: falta el array de suscripciones")
        }

        // Validate currencies
        for (const currency of data.currencies) {
          if (!currency.id || !currency.code || !currency.name || !currency.symbol) {
            throw new Error("Formato de moneda inválido")
          }
          if (typeof currency.conversionRate !== "number" || currency.conversionRate <= 0) {
            throw new Error("Tasa de conversión inválida")
          }
        }

        // Validate subscriptions
        for (const sub of data.subscriptions) {
          if (!sub.id || !sub.name || !sub.currencyId) {
            throw new Error("Formato de suscripción inválido")
          }
          if (typeof sub.amount !== "number" || sub.amount < 0) {
            throw new Error("Monto de suscripción inválido")
          }
          if (typeof sub.paymentDay !== "number" || sub.paymentDay < 1 || sub.paymentDay > 31) {
            throw new Error("Día de pago inválido")
          }
        }

        // Import data
        importData(data)
        setImportOpen(false)
        toast({
          title: "Importación exitosa",
          description: `${data.currencies.length} monedas y ${data.subscriptions.length} suscripciones importadas`,
        })

        // Reset file input
        event.target.value = ""
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Error al procesar el archivo")
      }
    }

    reader.onerror = () => {
      setImportError("Error al leer el archivo")
    }

    reader.readAsText(file)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
        <Download className="h-4 w-4" />
        Exportar
      </Button>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Datos</DialogTitle>
            <DialogDescription>
              Seleccione un archivo JSON con sus datos de respaldo. Esto reemplazará todos los datos actuales.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <FileJson className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-foreground">Seleccionar archivo JSON</span>
                <p className="text-xs text-muted-foreground mt-1">o arrastre y suelte aquí</p>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                className="hidden"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Advertencia:</strong> La importación reemplazará todas sus monedas y suscripciones actuales.
                Asegúrese de exportar sus datos actuales antes de importar.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
