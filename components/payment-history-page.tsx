"use client"

import { useStore } from "@/lib/store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatAmount } from "@/lib/utils"
import { Trash2 } from "lucide-react"

export function PaymentHistoryPage() {
  const { subscriptions, currencies, payments, deletePayment, language } = useStore()
  const t = translations[language]

  const getSubscriptionName = (subscriptionId: string) => {
    return subscriptions.find((s) => s.id === subscriptionId)?.name || "Unknown"
  }

  const getSubscriptionCurrency = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId)
    return currencies.find((c) => c.id === subscription?.currencyId)
  }

  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.paymentHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <p className="text-muted-foreground">{t.noPayments}</p>
          ) : (
            <div className="space-y-3">
              {sortedPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{getSubscriptionName(payment.subscriptionId)}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.paidOn} {formatDateDisplay(payment.date)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {payment.isPartial ? t.partialPayment : t.fullPayment}
                      {payment.isPartial &&
                        ` - ${t.balance}: ${formatAmount(payment.remainingBalance, getSubscriptionCurrency(payment.subscriptionId))}`}
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-medium text-lg">
                      {formatAmount(payment.amount, getSubscriptionCurrency(payment.subscriptionId))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deletePayment(payment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
