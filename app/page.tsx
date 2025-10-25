"use client"

import { CurrencyManager } from "@/components/currency-manager"
import { SubscriptionManager } from "@/components/subscription-manager"
import { SubscriptionSummary } from "@/components/subscription-summary"
import { DataManager } from "@/components/data-manager"
import { SettingsMenu } from "@/components/settings-menu"
import { Toaster } from "@/components/ui/toaster"
import { useStore } from "@/lib/store"
import { translations } from "@/lib/translations"
import { useEffect } from "react"

export default function Home() {
  const { language, theme } = useStore()
  const t = translations[language]

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
      <Toaster />
    </main>
  )
}
