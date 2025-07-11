import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function calculateMaturityLevel(plantedAt: Date, harvestAt: Date): number {
  const now = new Date()
  const totalTime = harvestAt.getTime() - plantedAt.getTime()
  const elapsed = now.getTime() - plantedAt.getTime()
  return Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
}

export function getMaturityColor(level: number): string {
  if (level >= 100) return "text-green-600"
  if (level >= 75) return "text-yellow-600"
  if (level >= 50) return "text-orange-600"
  return "text-red-600"
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "legendary":
      return "text-purple-600 bg-purple-50"
    case "epic":
      return "text-blue-600 bg-blue-50"
    case "rare":
      return "text-green-600 bg-green-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}
