export interface Product {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number
    imageUrl: string
    category: string
    brand: string
    rating: number
    reviewCount: number
    inStock: boolean
    retailer: "walmart" | "amazon" | "target"
    productUrl: string
    relatedCropTypes: string[]
  }
  
  export interface CartItem {
    product: Product
    quantity: number
    addedAt: Date
  }
  
  export interface ShoppingRecommendation {
    cropId: string
    products: Product[]
    reason: string
    category: "seeds" | "tools" | "fertilizer" | "recipes" | "related"
  }
  