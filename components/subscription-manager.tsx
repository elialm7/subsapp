"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"
import type { Subscription, Currency } from "@/lib/types"

export function SubscriptionManager() {
  const { subscriptions, currencies, addSubscription, updateSubscription, deleteSubscription } = useStore()
  const [open, setOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currencyId: currencies[0]?.id || "",
    paymentDay: "1",
    hasTax: false,
    taxRate: "0",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subscriptionData = {
      name: formData.name,
      amount: Number.parseFloat(formData.amount),
      currencyId: formData.currencyId,
      paymentDay: Number.parseInt(formData.paymentDay),
      hasTax: formData.hasTax,
      taxRate: formData.hasTax ? Number.parseFloat(formData.taxRate) : 0,
    }

    if (editingSubscription) {
      updateSubscription(editingSubscription.id, subscriptionData)
    } else {
      addSubscription({
        id: Date.now().toString(),
        ...subscriptionData,
      })
    }

    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      currencyId: currencies[0]?.id || "",
      paymentDay: "1",
      hasTax: false,
      taxRate: "0",
    })
    setEditingSubscription(null)
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      name: subscription.name,
      amount: subscription.amount.toString(),
      currencyId: subscription.currencyId,
      paymentDay: subscription.paymentDay.toString(),
      hasTax: subscription.hasTax,
      taxRate: subscription.hasTax ? subscription.taxRate.toString() : "0",
    })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta suscripción?")) {
      deleteSubscription(id)
    }
  }

  const getCurrency = (currencyId: string) => {
    return currencies.find((c) => c.id === currencyId)
  }

  const calculateTotal = (subscription: Subscription) => {
    const baseAmount = subscription.amount
    const taxAmount = subscription.hasTax ? baseAmount * (subscription.taxRate / 100) : 0
    return baseAmount + taxAmount
  }

  const formatAmount = (amount: number, currency: Currency | undefined) => {
    if (!currency) return amount.toFixed(2)
    const parts = amount.toFixed(2).split(".")
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator)
    return `${currency.symbol}${integerPart}${currency.decimalSeparator}${parts[1]}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Suscripciones</h2>
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
              Agregar Suscripción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSubscription ? "Editar Suscripción" : "Nueva Suscripción"}</DialogTitle>
              <DialogDescription>Configure los detalles de su suscripción mensual</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Servicio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Netflix, Spotify, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="9.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={formData.currencyId}
                    onValueChange={(value) => setFormData({ ...formData, currencyId: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.code} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDay">Día de Pago (1-31)</Label>
                <Input
                  id="paymentDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.paymentDay}
                  onChange={(e) => setFormData({ ...formData, paymentDay: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Día del mes en que se cobra la suscripción</p>
              </div>

              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hasTax">Incluir Impuestos</Label>
                    <p className="text-xs text-muted-foreground">Agregar porcentaje de impuestos al monto</p>
                  </div>
                  <Switch
                    id="hasTax"
                    checked={formData.hasTax}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasTax: checked })}
                  />
                </div>

                {formData.hasTax && (
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                      placeholder="16"
                      required={formData.hasTax}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4">
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
                <Button type="submit">{editingSubscription ? "Actualizar" : "Crear"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subscriptions.length === 0 ? (
        <div className="p-8 rounded-lg bg-card border border-border text-center">
          <p className="text-muted-foreground mb-4">No hay suscripciones registradas</p>
          <p className="text-sm text-muted-foreground">Comience agregando su primera suscripción</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {subscriptions.map((subscription) => {
            const currency = getCurrency(subscription.currencyId)
            const total = calculateTotal(subscription)

            return (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{subscription.name}</h3>
                    {subscription.hasTax && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                        +{subscription.taxRate}% IVA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">{formatAmount(total, currency)}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Día {subscription.paymentDay}</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-xs">{currency?.code}</span>
                  </div>
                  {subscription.hasTax && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Base: {formatAmount(subscription.amount, currency)} + IVA:{" "}
                      {formatAmount(total - subscription.amount, currency)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(subscription)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(subscription.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
