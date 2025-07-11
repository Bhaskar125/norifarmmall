import { NextRequest, NextResponse } from 'next/server'
import { mockCrops, mockProducts } from '@/lib/mockData'

// Helper function to get all crops (mock + localStorage)
function getAllCrops() {
  try {
    // In a real API, you would read from a database
    // For this prototype, we'll just use mock data since we can't access localStorage in API routes
    return mockCrops
  } catch (error) {
    return mockCrops
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Get all crops (would come from database in real app)
    const allCrops = getAllCrops()

    // Find crop by name or NFT ID
    const crop = allCrops.find(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.nftTokenId?.toLowerCase() === query.toLowerCase() ||
      query.toLowerCase().includes(c.name.toLowerCase())
    )

    if (!crop) {
      return NextResponse.json(
        { error: `No crop found for query: ${query}` },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: `No matching products found for crop: ${crop.name}` },
        { status: 404 }
      )
    }

    // Format response according to requirements
    const response = {
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
        maturityLevel: crop.maturityLevel,
        isReady: crop.isReady,
        rarity: crop.rarity
      },
      allMatches: matchingProducts.length
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Crop match API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET requests for direct testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    )
  }

  // Convert to POST request format
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  }))
} 