"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import type { Currency } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CurrencyManager() {
  const { currencies, addCurrency, updateCurrency, deleteCurrency } = useStore()
  const [open, setOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    conversionRate: "1",
    thousandSeparator: ",",
    decimalSeparator: ".",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currencyData = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      symbol: formData.symbol,
      conversionRate: Number.parseFloat(formData.conversionRate),
      thousandSeparator: formData.thousandSeparator,
      decimalSeparator: formData.decimalSeparator,
    }

    if (editingCurrency) {
      updateCurrency(editingCurrency.id, currencyData)
    } else {
      addCurrency({
        id: Date.now().toString(),
        ...currencyData,
      })
    }

    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({ code: "", name: "", symbol: "", conversionRate: "1", thousandSeparator: ",", decimalSeparator: "." })
    setEditingCurrency(null)
  }

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency)
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      conversionRate: currency.conversionRate.toString(),
      thousandSeparator: currency.thousandSeparator,
      decimalSeparator: currency.decimalSeparator,
    })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    if (currencies.length === 1) {
      alert("Debe mantener al menos una moneda")
      return
    }
    if (confirm("¿Está seguro de eliminar esta moneda?")) {
      deleteCurrency(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Monedas</h2>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Moneda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCurrency ? "Editar Moneda" : "Nueva Moneda"}</DialogTitle>
              <DialogDescription>Configure la moneda y su tasa de conversión respecto al USD</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código (ej: EUR, MXN)</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="USD"
                  required
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="US Dollar"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Símbolo</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="$"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Tasa de Conversión desde USD</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={formData.conversionRate}
                  onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })}
                  placeholder="1.0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  1 USD = {formData.conversionRate} {formData.code || "XXX"}
                </p>
              </div>

              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h4 className="text-sm font-semibold text-foreground">Formato de Números</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thousandSeparator">Separador de Miles</Label>
                    <Select
                      value={formData.thousandSeparator}
                      onValueChange={(value) => setFormData({ ...formData, thousandSeparator: value })}
                    >
                      <SelectTrigger id="thousandSeparator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=",">, (coma)</SelectItem>
                        <SelectItem value=".">. (punto)</SelectItem>
                        <SelectItem value=" ">(espacio)</SelectItem>
                        <SelectItem value="none">(ninguno)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decimalSeparator">Separador Decimal</Label>
                    <Select
                      value={formData.decimalSeparator}
                      onValueChange={(value) => setFormData({ ...formData, decimalSeparator: value })}
                    >
                      <SelectTrigger id="decimalSeparator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=".">. (punto)</SelectItem>
                        <SelectItem value=",">, (coma)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ejemplo: {formData.symbol}
                  {(() => {
                    const parts = "1234.56".split(".")
                    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, formData.thousandSeparator)
                    return `${integerPart}${formData.decimalSeparator}${parts[1]}`
                  })()}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">{editingCurrency ? "Actualizar" : "Crear"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {currencies.map((currency) => (
          <div
            key={currency.id}
            className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-foreground">{currency.code}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">{currency.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {currency.symbol} • 1 USD = {currency.conversionRate} {currency.code}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formato: Miles ({currency.thousandSeparator === "" ? "ninguno" : currency.thousandSeparator}), Decimal (
                {currency.decimalSeparator})
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(currency)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(currency.id)}
                disabled={currencies.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
