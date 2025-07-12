"use client"

import type { Product } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  isAddingToCart?: boolean
}

export function ProductCard({ product, onAddToCart, isAddingToCart }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 hover:bg-red-600">
                Save {formatCurrency(product.originalPrice! - product.price)}
              </Badge>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{product.brand}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.originalPrice!)}
              </span>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {product.retailer}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
          <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </a>
        </Button>
        <Button
          size="sm"
          onClick={() => onAddToCart?.(product)}
          disabled={!product.inStock || isAddingToCart}
          className="flex-1"
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
