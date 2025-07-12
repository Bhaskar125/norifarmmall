"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/shopping/product-card"
import { useProducts } from "@/hooks/useProducts"
import { useShoppingCart } from "@/hooks/useShoppingCart"
import type { Product } from "@/types"
import { Search, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function ShoppingPage() {
  const { products, searchProducts } = useProducts()
  const { addToCart, totalItems, totalPrice } = useShoppingCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    // Load initial products - show all products on first load
    searchProducts("", "")
  }, [searchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProducts(searchQuery, activeCategory)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    // Instant filtering - no debounce
    searchProducts(query, activeCategory)
  }

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.id)
    try {
      addToCart(product)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setAddingToCart(null)
    }
  }

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category)
    // Instant filtering
    searchProducts(searchQuery, category)
  }

  const categories = ["Fresh Produce", "Exotic Fruits", "Fresh Herbs", "Seeds", "Tools", "Fertilizer"]

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farm Store</h1>
          <p className="text-muted-foreground mt-1">Everything you need for your real farming journey</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            {totalItems} items
          </Badge>
          <Button asChild>
            <Link href="/shopping/cart">View Cart (${totalPrice.toFixed(2)})</Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for farming products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories and Products */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
          <TabsTrigger 
            value="all" 
            onClick={() => handleCategoryFilter("")}
            className={`text-xs px-2 py-1 ${activeCategory === "" ? "bg-primary text-primary-foreground" : ""}`}
          >
            All
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category.toLowerCase().replace(/\s+/g, '-')} 
              onClick={() => handleCategoryFilter(category)}
              className={`text-xs px-2 py-1 ${activeCategory === category ? "bg-primary text-primary-foreground" : ""}`}
            >
              {category.includes(' ') ? category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : category}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Single content area - products are already filtered by the hook */}
        <div className="space-y-6">
          {/* Results counter */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
              {activeCategory && ` in ${activeCategory}`}
            </p>
            {(searchQuery || activeCategory) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory("")
                  searchProducts("", "")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAddingToCart={addingToCart === product.id}
              />
            ))}
          </div>
        </div>
      </Tabs>

      {products.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search terms or browse different categories</p>
            <Button onClick={() => {
              setSearchQuery("")
              setActiveCategory("")
              searchProducts("", "")
            }}>View All Products</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
