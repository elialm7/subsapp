"use client"

import { TrendingUp, DollarSign } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { useMemo } from "react"
import type { Currency } from "@/lib/types"
import { translations } from "@/lib/translations"
import { formatCurrency } from "@/lib/utils"

export function SubscriptionSummary() {
  const { subscriptions, currencies, selectedCurrency, setSelectedCurrency, language, payments } = useStore()
  const t = translations[language]

  const selectedCurrencyData = currencies.find((c) => c.id === selectedCurrency)

  const formatAmount = (amount: number, currency: Currency | undefined) => {
    if (!currency) {
      return formatCurrency(amount, "$", ",", ".")
    }
    return formatCurrency(amount, currency.symbol, currency.thousandSeparator, currency.decimalSeparator)
  }

  const calculations = useMemo(() => {
    // Calculate total debt in USD
    let totalDebtUSD = 0

    subscriptions.forEach((sub) => {
      const currency = currencies.find((c) => c.id === sub.currencyId)
      if (!currency) return

      const subTotal = sub.hasTax ? sub.amount * (1 + sub.taxRate / 100) : sub.amount
      const amountInUSD = subTotal / currency.conversionRate

      totalDebtUSD += amountInUSD
    })

    // Calculate total paid in USD
    let totalPaidUSD = 0

    payments.forEach((payment) => {
      const sub = subscriptions.find((s) => s.id === payment.subscriptionId)
      if (!sub) return

      const currency = currencies.find((c) => c.id === sub.currencyId)
      if (!currency) return

      const amountInUSD = payment.amount / currency.conversionRate
      totalPaidUSD += amountInUSD
    })

    const totalDebtInSelected = selectedCurrencyData ? totalDebtUSD * selectedCurrencyData.conversionRate : totalDebtUSD
    const totalPaidInSelected = selectedCurrencyData ? totalPaidUSD * selectedCurrencyData.conversionRate : totalPaidUSD

    return {
      totalDebt: totalDebtInSelected,
      totalPaid: totalPaidInSelected,
    }
  }, [subscriptions, currencies, selectedCurrency, selectedCurrencyData, payments])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{t.summary}</h2>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-[140px]">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t.totalDebt || "Deuda Total"}</p>
              <p className="text-3xl font-bold text-foreground">
                {formatAmount(calculations.totalDebt, selectedCurrencyData)}
              </p>
              <p className="text-xs text-muted-foreground font-mono">{selectedCurrencyData?.code || "USD"}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t.totalPaid || "Total Pagado"}</p>
              <p className="text-3xl font-bold text-foreground">
                {formatAmount(calculations.totalPaid, selectedCurrencyData)}
              </p>
              <p className="text-xs text-muted-foreground">
                {payments.length}{" "}
                {payments.length === 1
                  ? language === "es"
                    ? "pago"
                    : "payment"
                  : language === "es"
                    ? "pagos"
                    : "payments"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
