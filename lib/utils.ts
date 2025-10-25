import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
