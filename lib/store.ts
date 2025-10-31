"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Currency, Subscription, Payment, AppData } from "./types"
import type { Language } from "./translations"

interface StoreState {
  currencies: Currency[]
  subscriptions: Subscription[]
  payments: Payment[]
  selectedCurrency: string
  language: Language
  theme: "light" | "dark"
  addCurrency: (currency: Currency) => void
  updateCurrency: (id: string, currency: Partial<Currency>) => void
  deleteCurrency: (id: string) => void
  addSubscription: (subscription: Subscription) => void
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void
  deleteSubscription: (id: string) => void
  addPayment: (payment: Payment) => void
  deletePayment: (id: string) => void
  getPaymentsBySubscription: (subscriptionId: string) => Payment[]
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
      payments: [],
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

      addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),

      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),

      getPaymentsBySubscription: (subscriptionId) => {
        const payments = get().payments
        return payments.filter((p) => p.subscriptionId === subscriptionId)
      },

      setSelectedCurrency: (currencyId) => set({ selectedCurrency: currencyId }),

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => set({ theme }),

      importData: (data) =>
        set({
          currencies: data.currencies.length > 0 ? data.currencies : defaultCurrencies,
          subscriptions: data.subscriptions,
          payments: data.payments || [],
        }),

      exportData: () => ({
        currencies: get().currencies,
        subscriptions: get().subscriptions,
        payments: get().payments,
      }),
    }),
    {
      name: "subscription-manager-storage",
    },
  ),
)
