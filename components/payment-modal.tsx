"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { translations } from "@/lib/translations"
import { formatAmount, formatNumberByCurrency, parseNumberByCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Subscription } from "@/lib/types"

interface PaymentModalProps {
  subscription: Subscription
  balance: number
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
}

export function PaymentModal({ subscription, balance, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const { currencies, addPayment, language } = useStore()
  const t = translations[language]
  const { toast } = useToast()

  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [paymentAmountDisplay, setPaymentAmountDisplay] = useState<string>("")

  const currency = currencies.find((c) => c.id === subscription.currencyId)

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const parseDateFromDisplay = (displayDate: string) => {
    const parts = displayDate.split("/")
    if (parts.length !== 3) return paymentDate
    const [day, month, year] = parts
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.toISOString().split("T")[0]
  }

  const handlePayment = () => {
    const amount = parseNumberByCurrency(paymentAmountDisplay, currency)

    if (!paymentAmountDisplay) {
      toast({
        title: "Error",
        description: language === "es" ? "Por favor ingresa un monto" : "Please enter an amount",
        variant: "destructive",
      })
      return
    }

    if (amount <= 0) {
      toast({
        title: "Error",
        description: language === "es" ? "El monto debe ser mayor a 0" : "Amount must be greater than 0",
        variant: "destructive",
      })
      return
    }

    if (amount > balance) {
      toast({
        title: "Error",
        description:
          language === "es"
            ? `No puedes pagar más de ${formatAmount(balance, currency)}`
            : `Cannot pay more than ${formatAmount(balance, currency)}`,
        variant: "destructive",
      })
      return
    }

    const remainingBalance = balance - amount
    const isPartial = remainingBalance > 0

    addPayment({
      id: Date.now().toString(),
      subscriptionId: subscription.id,
      amount,
      date: paymentDate,
      isPartial,
      remainingBalance,
    })

    toast({
      title: "Success",
      description: isPartial ? t.partialPayment : t.fullPayment,
    })

    setPaymentAmount("")
    setPaymentDate(new Date().toISOString().split("T")[0])
    setPaymentAmountDisplay("")
    onPaymentSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t.makePayment} - {subscription.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t.balance}</label>
            <div className="text-2xl font-bold text-primary">{formatAmount(balance, currency)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.paymentDate}</label>
            <Input
              type="text"
              placeholder="dd/mm/yyyy"
              value={formatDateForDisplay(paymentDate)}
              onChange={(e) => {
                const isoDate = parseDateFromDisplay(e.target.value)
                setPaymentDate(isoDate)
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.paymentAmount}</label>
            <div className="flex items-center">
              <span className="text-lg font-semibold mr-2">{currency?.symbol || ""}</span>
              <Input
                type="text"
                placeholder={formatNumberByCurrency(0, currency)}
                value={paymentAmountDisplay}
                onChange={(e) => setPaymentAmountDisplay(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t.partialPaymentInfo}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handlePayment}>{t.pay}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
