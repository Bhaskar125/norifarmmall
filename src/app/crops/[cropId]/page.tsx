"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Loading } from "@/components/ui/loading"
import { EditCropModal } from "@/components/crops/edit-crop-modal"
import { HarvestToCartWidget } from "@/components/shopping/harvest-to-cart-widget"
import { useCrops } from "@/hooks/useCrops"
import type { Crop } from "@/types"
import { 
  ArrowLeft, 
  Calendar, 
  Sparkles, 
  Zap, 
  MapPin, 
  Ruler, 
  TrendingUp, 
  Trophy,
  Edit,
  Trash2,
  ShoppingCart,
  Clock,
  Leaf,
  Star
} from "lucide-react"
import { formatDate, getRarityColor, getMaturityColor } from "@/lib/utils"
import Link from "next/link"

export default function CropDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { crops, harvestCrop, editCrop, deleteCrop } = useCrops()
  const [crop, setCrop] = useState<Crop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHarvesting, setIsHarvesting] = useState(false)
  const [harvestedCrop, setHarvestedCrop] = useState<Crop | null>(null)
  const [showHarvestWidget, setShowHarvestWidget] = useState(false)
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const cropId = params.cropId as string

  useEffect(() => {
    if (crops.length > 0) {
      const foundCrop = crops.find(c => c.id === cropId)
      if (foundCrop) {
        setCrop(foundCrop)
      } else {
        setError("Crop not found")
      }
      setLoading(false)
    }
  }, [crops, cropId])

  const handleHarvest = async () => {
    if (!crop) return
    
    setIsHarvesting(true)
    try {
      await harvestCrop(crop.id)
      setHarvestedCrop(crop)
      setShowHarvestWidget(true)
    } catch (error) {
      console.error("Harvest failed:", error)
      alert("Failed to harvest crop. Please try again.")
    } finally {
      setIsHarvesting(false)
    }
  }

  const handleEdit = () => {
    if (!crop) return
    setEditingCrop(crop)
    setShowEditModal(true)
  }

  const handleEditSave = async (cropData: any) => {
    try {
      await editCrop(cropData)
      setShowEditModal(false)
      setEditingCrop(null)
      // Refresh crop data
      const updatedCrop = crops.find(c => c.id === cropId)
      if (updatedCrop) {
        setCrop(updatedCrop)
      }
    } catch (error) {
      console.error("Edit failed:", error)
      throw error
    }
  }

  const handleDelete = async () => {
    if (!crop) return
    
    if (confirm(`Are you sure you want to delete "${crop.name}"? This action cannot be undone.`)) {
      try {
        await deleteCrop(crop.id)
        router.push("/crops")
      } catch (error) {
        console.error("Delete failed:", error)
        alert("Failed to delete crop. Please try again.")
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Loading crop details..." />
        </div>
      </div>
    )
  }

  if (error || !crop) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg font-medium">Crop not found</p>
              <p className="text-sm mb-4">The crop you're looking for doesn't exist.</p>
              <Button asChild>
                <Link href="/crops">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Crops
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const maturityColor = getMaturityColor(crop.maturityLevel)
  const rarityColor = getRarityColor(crop.rarity)
  const daysToHarvest = Math.ceil((crop.harvestAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const daysSincePlanted = Math.ceil((Date.now() - crop.plantedAt.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/crops">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Crops
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{crop.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={rarityColor}>
                <Sparkles className="w-3 h-3 mr-1" />
                {crop.rarity}
              </Badge>
              {crop.nftTokenId && (
                <Badge variant="secondary" className="text-xs">
                  #{crop.nftTokenId}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Quick Actions */}
        <div className="space-y-6">
          {/* Crop Image */}
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img 
                  src={crop.imageUrl || "/placeholder.svg"} 
                  alt={crop.name} 
                  className="w-full h-full object-cover" 
                />
                {crop.isReady && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <Zap className="w-3 h-3 mr-1" />
                      Ready!
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {crop.isReady && (
                <Button 
                  onClick={handleHarvest} 
                  disabled={isHarvesting}
                  className="w-full"
                >
                  {isHarvesting ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      Harvesting...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Harvest Now
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/crop-match?query=${encodeURIComponent(crop.name)}`}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Find in Store
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Maturity Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Maturity Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Progress</span>
                    <span className={`text-sm font-medium ${maturityColor}`}>
                      {Math.round(crop.maturityLevel)}%
                    </span>
                  </div>
                  <Progress value={crop.maturityLevel} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{daysSincePlanted}</div>
                      <div className="text-xs text-muted-foreground">Days Growing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{crop.isReady ? 0 : daysToHarvest}</div>
                      <div className="text-xs text-muted-foreground">Days Left</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge variant="outline" className="capitalize">{crop.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={crop.isReady ? "default" : "outline"}>
                          {crop.isReady ? "Ready" : "Growing"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expected Yield</span>
                        <span className="text-sm font-medium">{crop.expectedYield} units</span>
                      </div>
                      {crop.actualYield && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Actual Yield</span>
                          <span className="text-sm font-medium">{crop.actualYield} units</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {crop.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{crop.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="growth" className="space-y-6">
              {/* Growth Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Growth Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Planted</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(crop.plantedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        crop.isReady ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Trophy className={`w-4 h-4 ${
                          crop.isReady ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Harvest</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(crop.harvestAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      {crop.isReady ? (
                        "🎉 Your crop is ready for harvest!"
                      ) : (
                        `⏱️ ${daysToHarvest} day${daysToHarvest === 1 ? '' : 's'} until harvest`
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Stages */}
              <Card>
                <CardHeader>
                  <CardTitle>Growth Stages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { stage: "Seed", progress: 0, label: "Planted" },
                      { stage: "Sprout", progress: 25, label: "Sprouting" },
                      { stage: "Growth", progress: 50, label: "Growing" },
                      { stage: "Maturity", progress: 75, label: "Maturing" },
                      { stage: "Harvest", progress: 100, label: "Ready" }
                    ].map((stage, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          crop.maturityLevel >= stage.progress ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{stage.stage}</span>
                            <span className="text-xs text-muted-foreground">{stage.progress}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{stage.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Crop ID</span>
                        <span className="text-sm font-mono">{crop.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">NFT Token</span>
                        <span className="text-sm font-mono">{crop.nftTokenId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rarity Level</span>
                        <Badge variant="outline" className={rarityColor}>
                          {crop.rarity}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Crop Type</span>
                        <span className="text-sm font-medium capitalize">{crop.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Maturity Level</span>
                        <span className="text-sm font-medium">{Math.round(crop.maturityLevel)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Growth Duration</span>
                        <span className="text-sm font-medium">
                          {Math.ceil((crop.harvestAt.getTime() - crop.plantedAt.getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Yield Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Yield Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{crop.expectedYield}</div>
                        <div className="text-sm text-muted-foreground">Expected Yield</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{crop.actualYield || '?'}</div>
                        <div className="text-sm text-muted-foreground">Actual Yield</div>
                      </div>
                    </div>
                    {crop.actualYield && (
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Yield Efficiency: {Math.round((crop.actualYield / crop.expectedYield) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Harvest to Cart Widget */}
      {harvestedCrop && (
        <HarvestToCartWidget
          harvestedCrop={harvestedCrop}
          isVisible={showHarvestWidget}
          onClose={() => {
            setShowHarvestWidget(false)
            setHarvestedCrop(null)
          }}
        />
      )}

      {/* Edit Crop Modal */}
      {editingCrop && (
        <EditCropModal
          crop={editingCrop}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingCrop(null)
          }}
          onSave={handleEditSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
} 