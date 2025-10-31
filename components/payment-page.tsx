"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionSummary } from "@/components/subscription-summary"
import { formatAmount } from "@/lib/utils"
import { PaymentModal } from "@/components/payment-modal"
import { useToast } from "@/hooks/use-toast"

export function PaymentPage() {
  const { subscriptions, currencies, payments, language } = useStore()
  const t = translations[language]
  const { toast } = useToast()

  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const getSubscriptionBalance = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId)
    if (!subscription) return 0

    const currency = currencies.find((c) => c.id === subscription.currencyId)
    if (!currency) return 0

    const subscriptionTotal = subscription.amount * (1 + (subscription.hasTax ? subscription.taxRate / 100 : 0))
    const subscriptionPayments = payments.filter((p) => p.subscriptionId === subscriptionId)
    const totalPaid = subscriptionPayments.reduce((sum, p) => sum + p.amount, 0)

    const balance = subscriptionTotal - totalPaid
    return Math.round(balance * 100) / 100 > 0 ? Math.round(balance * 100) / 100 : 0
  }

  const getTotalDebt = () => {
    return subscriptions.reduce((total, sub) => {
      return total + getSubscriptionBalance(sub.id)
    }, 0)
  }

  const subscriptionsWithBalance = subscriptions.filter((sub) => getSubscriptionBalance(sub.id) > 0)

  const handleRestartCycle = () => {
    if (window.confirm(t.restartConfirm)) {
      const { payments: existingPayments } = useStore.getState()
      existingPayments.forEach((p) => {
        useStore.getState().deletePayment(p.id)
      })
      setRefreshTrigger((prev) => prev + 1)
      toast({
        title: "Success",
        description: language === "es" ? "Ciclo reiniciado" : "Cycle restarted",
      })
    }
  }

  const handlePaymentSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <SubscriptionSummary key={refreshTrigger} />

      <div className="flex gap-2">
        <Button onClick={handleRestartCycle} variant="outline" className="flex-1 bg-transparent">
          {t.restart}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.totalDebt}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{formatAmount(getTotalDebt(), currencies[0])}</div>
          <p className="text-sm text-muted-foreground mt-2">
            {subscriptionsWithBalance.length}{" "}
            {language === "es" ? "suscripción(es) pendiente(s)" : "pending subscription(s)"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.subscriptionManager}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptionsWithBalance.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t.allPaid}</p>
            ) : (
              subscriptionsWithBalance.map((sub) => {
                const currency = currencies.find((c) => c.id === sub.currencyId)
                const balance = getSubscriptionBalance(sub.id)
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{sub.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t.balance}: <span className="font-medium">{formatAmount(balance, currency)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.paymentDay}: {sub.paymentDay}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button onClick={() => setSelectedSubscription(sub.id)} size="sm">
                        {t.payNow}
                      </Button>
                      <Button
                        onClick={() => {
                          useStore.getState().addPayment({
                            id: Date.now().toString(),
                            subscriptionId: sub.id,
                            amount: balance,
                            date: new Date().toISOString().split("T")[0],
                            type: "full",
                          })
                          handlePaymentSuccess()
                        }}
                        size="sm"
                        variant="default"
                      >
                        {language === "es" ? "Pagar Todo" : "Pay All"}
                      </Button>
                    </div>
                    {selectedSubscription === sub.id && (
                      <PaymentModal
                        subscription={sub}
                        balance={balance}
                        isOpen={true}
                        onClose={() => setSelectedSubscription(null)}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
