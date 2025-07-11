import { mockCrops, mockProducts } from './mockData'
import type { Crop } from '@/types'

const CROPS_STORAGE_KEY = 'nori-farm-crops'

interface MatchedProduct {
  title: string
  price: string
  image: string
  buyLink: string
  description: string
  rating: number
  inStock: boolean
}

interface CropDetails {
  id: string
  type: string
  maturityLevel: number
  isReady: boolean
  rarity: string
}

interface CropMatchResponse {
  crop: string
  matchedProduct: MatchedProduct
  cropDetails: CropDetails
  allMatches: number
}

// Get all crops from localStorage and mockData
function getAllCrops(): Crop[] {
  try {
    const storedCrops = localStorage.getItem(CROPS_STORAGE_KEY)
    if (storedCrops) {
      const parsedCrops = JSON.parse(storedCrops) as Array<Omit<Crop, 'plantedAt' | 'harvestAt'> & { plantedAt: string; harvestAt: string }>
      return parsedCrops.map((crop) => ({
        ...crop,
        plantedAt: new Date(crop.plantedAt),
        harvestAt: new Date(crop.harvestAt),
      }))
    }
    return mockCrops
  } catch (error) {
    console.error('Error reading crops from localStorage:', error)
    return mockCrops
  }
}

export function matchCropToProduct(query: string): CropMatchResponse | null {
  try {
    if (!query) {
      throw new Error('Query parameter is required')
    }

    // Get all crops including newly planted ones
    const allCrops = getAllCrops()

    // Find crop by name or NFT ID
    const crop = allCrops.find(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.nftTokenId?.toLowerCase() === query.toLowerCase() ||
      query.toLowerCase().includes(c.name.toLowerCase())
    )

    if (!crop) {
      throw new Error(`No crop found for query: ${query}`)
    }

    // Find matching products based on crop type and name
    const matchingProducts = mockProducts.filter(product => 
      product.relatedCropTypes.includes(crop.type) ||
      product.name.toLowerCase().includes(crop.name.toLowerCase()) ||
      product.description.toLowerCase().includes(crop.name.toLowerCase())
    )

    // If no direct matches, find products that match crop type
    if (matchingProducts.length === 0) {
      const fallbackProducts = mockProducts.filter(product => 
        product.relatedCropTypes.includes(crop.type)
      )
      
      if (fallbackProducts.length > 0) {
        matchingProducts.push(fallbackProducts[0])
      }
    }

    // Select best matching product (first one for now)
    const bestMatch = matchingProducts[0]

    if (!bestMatch) {
      throw new Error(`No matching products found for crop: ${crop.name}`)
    }

    // Calculate maturity level
    const now = Date.now()
    const planted = crop.plantedAt.getTime()
    const harvest = crop.harvestAt.getTime()
    const maturityLevel = Math.min(100, Math.max(0, ((now - planted) / (harvest - planted)) * 100))

    // Format response according to requirements
    const response: CropMatchResponse = {
      crop: crop.nftTokenId ? `${crop.name} #${crop.nftTokenId.replace('NFT', '')}` : crop.name,
      matchedProduct: {
        title: bestMatch.name,
        price: `${bestMatch.price.toLocaleString('ko-KR')} KRW`,
        image: bestMatch.imageUrl,
        buyLink: bestMatch.productUrl || `https://norifarm-shop.com/product/${bestMatch.id}`,
        description: bestMatch.description,
        rating: bestMatch.rating,
        inStock: bestMatch.inStock
      },
      cropDetails: {
        id: crop.id,
        type: crop.type,
        maturityLevel: Math.round(maturityLevel),
        isReady: maturityLevel >= 100,
        rarity: crop.rarity
      },
      allMatches: matchingProducts.length
    }

    return response
  } catch (error) {
    console.error('Crop match error:', error)
    return null
  }
} 