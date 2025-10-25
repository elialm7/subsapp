"use client"

import { TrendingUp, DollarSign, Calendar, CreditCard } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { useMemo } from "react"
import type { Currency } from "@/types"
import { translations } from "@/lib/translations"
import { formatCurrency } from "@/lib/utils"

export function SubscriptionSummary() {
  const { subscriptions, currencies, selectedCurrency, setSelectedCurrency, language } = useStore()
  const t = translations[language]

  const selectedCurrencyData = currencies.find((c) => c.id === selectedCurrency)

  const formatAmount = (amount: number, currency: Currency | undefined) => {
    if (!currency) {
      return formatCurrency(amount, "$", ",", ".")
    }
    return formatCurrency(amount, currency.symbol, currency.thousandSeparator, currency.decimalSeparator)
  }

  const calculations = useMemo(() => {
    // Calculate total in USD first
    let totalUSD = 0
    const subscriptionsByDay: { [key: number]: number } = {}

    subscriptions.forEach((sub) => {
      const currency = currencies.find((c) => c.id === sub.currencyId)
      if (!currency) return

      // Calculate subscription total with tax
      const subTotal = sub.hasTax ? sub.amount * (1 + sub.taxRate / 100) : sub.amount

      const amountInUSD = subTotal / currency.conversionRate

      totalUSD += amountInUSD

      // Track by payment day
      if (!subscriptionsByDay[sub.paymentDay]) {
        subscriptionsByDay[sub.paymentDay] = 0
      }
      subscriptionsByDay[sub.paymentDay] += amountInUSD
    })

    const totalInSelectedCurrency = selectedCurrencyData ? totalUSD * selectedCurrencyData.conversionRate : totalUSD

    // Calculate average per subscription
    const averagePerSub = subscriptions.length > 0 ? totalInSelectedCurrency / subscriptions.length : 0

    // Find next payment
    const today = new Date()
    const currentDay = today.getDate()
    const paymentDays = Object.keys(subscriptionsByDay)
      .map(Number)
      .sort((a, b) => a - b)

    let nextPaymentDay = paymentDays.find((day) => day >= currentDay)
    if (!nextPaymentDay) {
      nextPaymentDay = paymentDays[0] // Next month
    }

    const nextPaymentAmount = nextPaymentDay
      ? subscriptionsByDay[nextPaymentDay] * (selectedCurrencyData?.conversionRate || 1)
      : 0

    return {
      total: totalInSelectedCurrency,
      average: averagePerSub,
      count: subscriptions.length,
      nextPaymentDay,
      nextPaymentAmount,
    }
  }, [subscriptions, currencies, selectedCurrency, selectedCurrencyData])

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
              <p className="text-sm text-muted-foreground">{t.totalMonthly}</p>
              <p className="text-3xl font-bold text-foreground">
                {formatAmount(calculations.total, selectedCurrencyData)}
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
              <p className="text-sm text-muted-foreground">{t.avgPerSubscription}</p>
              <p className="text-3xl font-bold text-foreground">
                {formatAmount(calculations.average, selectedCurrencyData)}
              </p>
              <p className="text-xs text-muted-foreground">
                {calculations.count} {t.activeSubscriptions.toLowerCase()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t.nextPayment}</p>
              <p className="text-2xl font-bold text-foreground">
                {calculations.nextPaymentDay
                  ? `${language === "es" ? "Día" : "Day"} ${calculations.nextPaymentDay}`
                  : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                {calculations.nextPaymentAmount > 0
                  ? formatAmount(calculations.nextPaymentAmount, selectedCurrencyData)
                  : language === "es"
                    ? "Sin pagos programados"
                    : "No scheduled payments"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t.activeSubscriptions}</p>
              <p className="text-2xl font-bold text-foreground">{calculations.count}</p>
              <p className="text-xs text-muted-foreground">
                {calculations.count === 0
                  ? language === "es"
                    ? "Agrega tu primera suscripción"
                    : "Add your first subscription"
                  : `${currencies.length} ${currencies.length === 1 ? (language === "es" ? "moneda" : "currency") : language === "es" ? "monedas" : "currencies"} ${language === "es" ? "configuradas" : "configured"}`}
              </p>
            </div>
            <div className="p-3 rounded-full bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {subscriptions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t.breakdownByCurrency}</h3>
          <div className="space-y-3">
            {currencies.map((currency) => {
              const subsInCurrency = subscriptions.filter((s) => s.currencyId === currency.id)
              if (subsInCurrency.length === 0) return null

              const totalInCurrency = subsInCurrency.reduce((sum, sub) => {
                const subTotal = sub.hasTax ? sub.amount * (1 + sub.taxRate / 100) : sub.amount
                return sum + subTotal
              }, 0)

              const totalInSelected = selectedCurrencyData
                ? (totalInCurrency / currency.conversionRate) * selectedCurrencyData.conversionRate
                : totalInCurrency

              return (
                <div
                  key={currency.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm font-semibold text-foreground w-12">{currency.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {subsInCurrency.length}{" "}
                      {subsInCurrency.length === 1
                        ? language === "es"
                          ? "suscripción"
                          : "subscription"
                        : language === "es"
                          ? "suscripciones"
                          : "subscriptions"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{formatAmount(totalInCurrency, currency)}</div>
                    {currency.id !== selectedCurrency && (
                      <div className="text-xs text-muted-foreground">
                        ≈ {formatAmount(totalInSelected, selectedCurrencyData)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
