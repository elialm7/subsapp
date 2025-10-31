"use client"

import { useState } from "react"
import { CurrencyManager } from "@/components/currency-manager"
import { SubscriptionManager } from "@/components/subscription-manager"
import { SubscriptionSummary } from "@/components/subscription-summary"
import { DataManager } from "@/components/data-manager"
import { SettingsMenu } from "@/components/settings-menu"
import { PaymentPage } from "@/components/payment-page"
import { PaymentHistoryPage } from "@/components/payment-history-page"
import { Toaster } from "@/components/ui/toaster"
import { useStore } from "@/lib/store"
import { translations } from "@/lib/translations"
import { useEffect } from "react"

type Tab = "dashboard" | "payments" | "history"

export default function Home() {
  const { language, theme } = useStore()
  const t = translations[language]
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t.appTitle}</h1>
              <p className="text-muted-foreground">{t.appDescription}</p>
            </div>
            <div className="flex gap-2">
              <SettingsMenu />
              <DataManager />
            </div>
          </div>
        </header>

        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "dashboard"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.dashboard}
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "payments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.payments}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.paymentHistory}
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="mb-6">
              <SubscriptionSummary />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <CurrencyManager />
              </div>

              <div className="lg:col-span-2">
                <SubscriptionManager />
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && <PaymentPage />}

        {/* History Tab */}
        {activeTab === "history" && <PaymentHistoryPage />}
      </div>
      <Toaster />
    </main>
  )
}
