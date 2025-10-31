import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCurrency(value: number, symbol: string, thousandSeparator = ",", decimalSeparator = "."): string {
  const parts = value.toFixed(2).split(".")
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
  const decimalPart = parts[1]
  return `${symbol}${integerPart}${decimalSeparator}${decimalPart}`
}

export function formatAmount(amount: number, currency: Currency | undefined) {
  if (!currency) return amount.toFixed(2)
  const parts = amount.toFixed(2).split(".")
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator)
  return `${currency.symbol}${integerPart}${currency.decimalSeparator}${parts[1]}`
}

export function formatDate(dateString: string, language: string): string {
  const date = new Date(dateString)
  if (language === "es") {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatNumberByCurrency(value: number, currency: Currency | undefined): string {
  if (!currency) return value.toFixed(2)
  const parts = value.toFixed(2).split(".")
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator)
  return `${integerPart}${currency.decimalSeparator}${parts[1]}`
}

export function parseNumberByCurrency(displayValue: string, currency: Currency | undefined): number {
  if (!currency) return Number.parseFloat(displayValue)
  // Reemplazar separadores por puntos estándar para parsear
  let normalized = displayValue
  if (currency.thousandSeparator) {
    normalized = normalized.replaceAll(currency.thousandSeparator, "")
  }
  if (currency.decimalSeparator !== ".") {
    normalized = normalized.replace(currency.decimalSeparator, ".")
  }
  return Number.parseFloat(normalized) || 0
}
