"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Currency, Subscription, AppData } from "./types"
import type { Language } from "./translations"

interface StoreState {
  currencies: Currency[]
  subscriptions: Subscription[]
  selectedCurrency: string
  language: Language
  theme: "light" | "dark"
  addCurrency: (currency: Currency) => void
  updateCurrency: (id: string, currency: Partial<Currency>) => void
  deleteCurrency: (id: string) => void
  addSubscription: (subscription: Subscription) => void
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void
  deleteSubscription: (id: string) => void
  setSelectedCurrency: (currencyId: string) => void
  setLanguage: (language: Language) => void
  setTheme: (theme: "light" | "dark") => void
  importData: (data: AppData) => void
  exportData: () => AppData
}

const defaultCurrencies: Currency[] = [
  {
    id: "1",
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    conversionRate: 1,
    thousandSeparator: ",",
    decimalSeparator: ".",
  },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currencies: defaultCurrencies,
      subscriptions: [],
      selectedCurrency: "1",
      language: "en",
      theme: "dark",

      addCurrency: (currency) => set((state) => ({ currencies: [...state.currencies, currency] })),

      updateCurrency: (id, updatedCurrency) =>
        set((state) => ({
          currencies: state.currencies.map((c) => (c.id === id ? { ...c, ...updatedCurrency } : c)),
        })),

      deleteCurrency: (id) =>
        set((state) => ({
          currencies: state.currencies.filter((c) => c.id !== id),
          subscriptions: state.subscriptions.filter((s) => s.currencyId !== id),
        })),

      addSubscription: (subscription) => set((state) => ({ subscriptions: [...state.subscriptions, subscription] })),

      updateSubscription: (id, updatedSubscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) => (s.id === id ? { ...s, ...updatedSubscription } : s)),
        })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),

      setSelectedCurrency: (currencyId) => set({ selectedCurrency: currencyId }),

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => set({ theme }),

      importData: (data) =>
        set({
          currencies: data.currencies.length > 0 ? data.currencies : defaultCurrencies,
          subscriptions: data.subscriptions,
        }),

      exportData: () => ({
        currencies: get().currencies,
        subscriptions: get().subscriptions,
      }),
    }),
    {
      name: "subscription-manager-storage",
    },
  ),
)
