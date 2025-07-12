"use client"

import { useState, useCallback } from "react"
import type { Product, ShoppingRecommendation } from "@/types"
import { mockProducts } from "@/lib/mockData"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])

  const searchProducts = useCallback((query: string, category?: string): Product[] => {
    let filtered = mockProducts
    
    // Filter by search query
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm)
      )
    }
    
    // Filter by category
    if (category && category.trim()) {
      const categoryFilter = category.trim()
      filtered = filtered.filter((p) => p.category === categoryFilter)
    }

    setProducts(filtered)
    return filtered
  }, [])

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
    searchProducts,
    getRecommendationsForCrop,
  }
}
