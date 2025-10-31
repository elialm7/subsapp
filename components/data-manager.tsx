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
import { translations } from "@/lib/translations"

export function DataManager() {
  const { exportData, importData, language } = useStore()
  const t = translations[language]
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
        title: language === "es" ? "Exportación exitosa" : "Export Successful",
        description:
          language === "es"
            ? "Sus datos han sido descargados correctamente"
            : "Your data has been downloaded successfully",
      })
    } catch (error) {
      toast({
        title: language === "es" ? "Error al exportar" : "Export Error",
        description: language === "es" ? "No se pudieron exportar los datos" : "Could not export data",
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
          throw new Error(
            language === "es"
              ? "Formato inválido: falta el array de monedas"
              : "Invalid format: missing currencies array",
          )
        }
        if (!data.subscriptions || !Array.isArray(data.subscriptions)) {
          throw new Error(
            language === "es"
              ? "Formato inválido: falta el array de suscripciones"
              : "Invalid format: missing subscriptions array",
          )
        }

        if (data.payments && !Array.isArray(data.payments)) {
          throw new Error(
            language === "es"
              ? "Formato inválido: payments debe ser un array"
              : "Invalid format: payments must be an array",
          )
        }

        // Validate currencies
        for (const currency of data.currencies) {
          if (!currency.id || !currency.code || !currency.name || !currency.symbol) {
            throw new Error(language === "es" ? "Formato de moneda inválido" : "Invalid currency format")
          }
          if (typeof currency.conversionRate !== "number" || currency.conversionRate <= 0) {
            throw new Error(language === "es" ? "Tasa de conversión inválida" : "Invalid conversion rate")
          }
        }

        // Validate subscriptions
        for (const sub of data.subscriptions) {
          if (!sub.id || !sub.name || !sub.currencyId) {
            throw new Error(language === "es" ? "Formato de suscripción inválido" : "Invalid subscription format")
          }
          if (typeof sub.amount !== "number" || sub.amount < 0) {
            throw new Error(language === "es" ? "Monto de suscripción inválido" : "Invalid subscription amount")
          }
          if (typeof sub.paymentDay !== "number" || sub.paymentDay < 1 || sub.paymentDay > 31) {
            throw new Error(language === "es" ? "Día de pago inválido" : "Invalid payment day")
          }
        }

        if (data.payments) {
          for (const payment of data.payments) {
            if (!payment.id || !payment.subscriptionId || typeof payment.amount !== "number") {
              throw new Error(language === "es" ? "Formato de pago inválido" : "Invalid payment format")
            }
          }
        }

        // Import data
        importData(data)
        setImportOpen(false)
        toast({
          title: language === "es" ? "Importación exitosa" : "Import Successful",
          description:
            language === "es"
              ? `${data.currencies.length} monedas, ${data.subscriptions.length} suscripciones y ${data.payments?.length || 0} pagos importados`
              : `${data.currencies.length} currencies, ${data.subscriptions.length} subscriptions and ${data.payments?.length || 0} payments imported`,
        })

        // Reset file input
        event.target.value = ""
      } catch (error) {
        setImportError(
          error instanceof Error
            ? error.message
            : language === "es"
              ? "Error al procesar el archivo"
              : "Error processing file",
        )
      }
    }

    reader.onerror = () => {
      setImportError(language === "es" ? "Error al leer el archivo" : "Error reading file")
    }

    reader.readAsText(file)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
        <Download className="h-4 w-4" />
        {t.exportData}
      </Button>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            {t.importData}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.importData}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Seleccione un archivo JSON con sus datos de respaldo. Esto reemplazará todos los datos actuales."
                : "Select a JSON file with your backup data. This will replace all current data."}
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
                <span className="text-sm font-medium text-foreground">
                  {language === "es" ? "Seleccionar archivo JSON" : "Select JSON file"}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "es" ? "o arrasque y suelte aquí" : "or drag and drop here"}
                </p>
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
                <strong>{language === "es" ? "Advertencia:" : "Warning:"}</strong>{" "}
                {language === "es"
                  ? " La importación reemplazará todas sus monedas, suscripciones y pagos actuales. Asegúrese de exportar sus datos actuales antes de importar."
                  : " Import will replace all your current currencies, subscriptions and payments. Make sure to export your current data before importing."}
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
