"use client"

import { useState, useEffect, useCallback } from "react"
import type { Product, Crop } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "./product-card"
import { useProducts } from "@/hooks/useProducts"
import { useShoppingCart } from "@/hooks/useShoppingCart"
import { Sparkles, ShoppingBag, X } from "lucide-react"
import { Loading } from "@/components/ui/loading"

interface HarvestToCartWidgetProps {
  harvestedCrop: Crop
  onClose: () => void
  isVisible: boolean
}

export function HarvestToCartWidget({ harvestedCrop, onClose, isVisible }: HarvestToCartWidgetProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const { getRecommendationsForCrop, loading } = useProducts()
  const { addToCart, totalItems } = useShoppingCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const loadRecommendations = useCallback(async () => {
    try {
      const result = await getRecommendationsForCrop(harvestedCrop.type)
      setRecommendations(result.products)
    } catch (error) {
      console.error("Failed to load recommendations:", error)
    }
  }, [getRecommendationsForCrop, harvestedCrop.type])

  useEffect(() => {
    if (isVisible && harvestedCrop) {
      loadRecommendations()
    }
  }, [isVisible, harvestedCrop, loadRecommendations])

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.id)
    try {
      addToCart(product)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setAddingToCart(null)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Harvest Complete!</CardTitle>
                <p className="text-green-100">You harvested {harvestedCrop.name} - here are some recommendations</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading size="lg" text="Finding perfect products for you..." />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recommended for You</h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  {totalItems} items in cart
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={addingToCart === product.id}
                  />
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recommendations available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
