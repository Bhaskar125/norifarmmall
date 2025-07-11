"use client"

import { useState } from "react"
import type { Product, ShoppingRecommendation } from "@/types"
import { mockProducts } from "@/lib/mockData"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const searchProducts = async (query: string, category?: string): Promise<Product[]> => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    let filtered = mockProducts
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      )
    }
    if (category) {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    }

    setProducts(filtered)
    setLoading(false)
    return filtered
  }

  const getRecommendationsForCrop = async (cropType: string): Promise<ShoppingRecommendation> => {
    // Simulate API call for recommendations
    await new Promise((resolve) => setTimeout(resolve, 500))

    const relatedProducts = mockProducts.filter((p) => p.relatedCropTypes.includes(cropType))

    return {
      cropId: "temp",
      products: relatedProducts,
      reason: `Perfect for your ${cropType} growing journey`,
      category: "related",
    }
  }

  return {
    products,
    loading,
    searchProducts,
    getRecommendationsForCrop,
  }
}
