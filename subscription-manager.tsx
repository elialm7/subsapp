"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { formatAmount } from "@/utils/formatAmount"
import type { Subscription } from "@/types/subscription"
import type { Currency } from "@/types/currency"

interface SubscriptionManagerProps {
  subscriptions: Subscription[]
  currency: Currency
  handleEdit: (subscription: Subscription) => void
  handleDelete: (id: string) => void
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  subscriptions,
  currency,
  handleEdit,
  handleDelete,
}) => {
  return (
    <div>
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{subscription.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-foreground font-mono">
                {formatAmount(subscription.total, currency)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{currency?.code}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Día {subscription.paymentDay}</span>
              {subscription.hasTax && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                  +{subscription.taxRate}% IVA
                </span>
              )}
            </div>
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
      ))}
    </div>
  )
}

export default SubscriptionManager
