export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  conversionRate: number // 1 USD = X of this currency (e.g., 1 USD = 7000 PYG)
  thousandSeparator: string // e.g., "," or "." or " "
  decimalSeparator: string // e.g., "." or ","
}

export interface Subscription {
  id: string
  name: string
  amount: number
  currencyId: string
  paymentDay: number // 1-31
  hasTax: boolean
  taxRate: number // Percentage
}

export interface Payment {
  id: string
  subscriptionId: string
  amount: number
  date: string // ISO date format
  isPartial: boolean
  remainingBalance: number
}

export interface AppData {
  currencies: Currency[]
  subscriptions: Subscription[]
  payments: Payment[]
}
