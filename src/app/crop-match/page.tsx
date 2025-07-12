"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ShoppingCart, Star, Package } from "lucide-react"
import Image from "next/image"

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

export default function CropMatchPage() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<CropMatchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Use client-side matching to include newly planted crops from JSON file
      const { matchCropToProduct } = await import('@/lib/cropMatcher')
      const data = await matchCropToProduct(query.trim())
      
      if (!data) {
        setError(`No crop found for query: ${query.trim()}`)
        return
      }

      setResult(data)
    } catch (err) {
      setError('Error: Failed to match crop')
      console.error('Crop match error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const exampleQueries = [
    "Tomato #124",
    "Heritage Tomatoes", 
    "NFT001",
    "Dragon Fruit",
    "Fresh Basil",
    "Golden Corn"
  ]

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Crop-to-Product Matching Prototype</h1>
        <p className="text-muted-foreground">
          Enter a crop name or NFT ID to find matching products for purchase
        </p>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search for Crop
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            🌱 Includes newly planted crops from your virtual farm (stored in JSON file)!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter crop name or NFT ID (e.g., 'Tomato #124')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Example Queries */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example) => (
                <Badge
                  key={example}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <Tabs defaultValue="formatted" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formatted">Formatted View</TabsTrigger>
            <TabsTrigger value="json">JSON Response</TabsTrigger>
          </TabsList>

          <TabsContent value="formatted" className="space-y-6">
            {/* Crop Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Found Crop: {result.crop}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="secondary">{result.cropDetails.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Maturity</p>
                    <p className="font-medium">{result.cropDetails.maturityLevel}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={result.cropDetails.isReady ? "default" : "outline"}>
                      {result.cropDetails.isReady ? "Ready" : "Growing"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rarity</p>
                    <Badge variant="outline">{result.cropDetails.rarity}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matched Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Matched Product
                  <Badge variant="secondary" className="ml-auto">
                    {result.allMatches} matches found
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="space-y-4">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={result.matchedProduct.image}
                        alt={result.matchedProduct.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">{result.matchedProduct.title}</h3>
                      <p className="text-muted-foreground">{result.matchedProduct.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{result.matchedProduct.rating}</span>
                      <Badge variant={result.matchedProduct.inStock ? "default" : "destructive"}>
                        {result.matchedProduct.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-green-600">
                        {result.matchedProduct.price}
                      </p>
                      <Button asChild className="w-full">
                        <a 
                          href={result.matchedProduct.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Buy Now
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json">
            <Card>
              <CardHeader>
                <CardTitle>JSON Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Demo Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test the Full Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">1. Plant a Crop</h4>
              <p className="text-blue-700">Go to &ldquo;My Crops&rdquo; → &ldquo;Plant New Crop&rdquo; and create a custom crop (e.g., &ldquo;Premium Avocado&rdquo;)</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">2. Check Dashboard</h4>
              <p className="text-green-700">Visit dashboard to see your new crop in the farm with maturity progress</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">3. Test Matching</h4>
              <p className="text-purple-700">Search for your crop here to find matching products to buy!</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Pro Tips:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Newly planted crops are automatically stored in JSON file and persist across sessions</li>
              <li>• Try planting &ldquo;Tomato&rdquo; or &ldquo;Basil&rdquo; to match with existing Korean products</li>
              <li>• NFT token IDs are auto-generated for crop identification</li>
              <li>• The crop-to-product matching works for both names and NFT IDs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 