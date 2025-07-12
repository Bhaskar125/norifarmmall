"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CropGrid } from "@/components/crops/crop-grid"
import { HarvestToCartWidget } from "@/components/shopping/harvest-to-cart-widget"
import { EditCropModal } from "@/components/crops/edit-crop-modal"
import { useCrops } from "@/hooks/useCrops"
import type { Crop } from "@/types"
import { Sprout, Trophy, Clock, Plus } from "lucide-react"
import Link from "next/link"

export default function CropsPage() {
  const { crops, loading, harvestCrop, editCrop, deleteCrop, readyCrops, growingCrops } = useCrops()
  const [harvestingCropId, setHarvestingCropId] = useState<string | undefined>(undefined)
  const [harvestedCrop, setHarvestedCrop] = useState<Crop | null>(null)
  const [showHarvestWidget, setShowHarvestWidget] = useState(false)
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleHarvest = async (cropId: string) => {
    setHarvestingCropId(cropId)
    try {
      await harvestCrop(cropId)
      const crop = crops.find((c) => c.id === cropId)
      if (crop) {
        setHarvestedCrop(crop)
        setShowHarvestWidget(true)
      }
    } catch (error) {
      console.error("Harvest failed:", error)
    } finally {
      setHarvestingCropId(undefined)
    }
  }

  const handleViewDetails = (cropId: string) => {
    window.location.href = `/crops/${cropId}`
  }

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop)
    setShowEditModal(true)
  }

  const handleEditSave = async (cropData: {
    id: string
    name: string
    type: "vegetable" | "fruit" | "grain" | "herb"
    description: string
    expectedYield: number
    rarity: "common" | "rare" | "epic" | "legendary"
    imageUrl: string
    growthDuration: number
    plantedAt: Date
    harvestAt: Date
    nftTokenId?: string
  }) => {
    try {
      await editCrop(cropData)
      setShowEditModal(false)
      setEditingCrop(null)
    } catch (error) {
      console.error("Edit failed:", error)
      throw error
    }
  }

  const handleDelete = async (cropId: string) => {
    const crop = crops.find(c => c.id === cropId)
    if (!crop) return
    
    if (confirm(`Are you sure you want to delete "${crop.name}"? This action cannot be undone.`)) {
      try {
        await deleteCrop(cropId)
      } catch (error) {
        console.error("Delete failed:", error)
        alert("Failed to delete crop. Please try again.")
      }
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Virtual Farm</h1>
          <p className="text-muted-foreground mt-1">Manage your crops and harvest when ready</p>
        </div>
        <Button asChild>
          <Link href="/crops/plant">
            <Plus className="w-4 h-4 mr-2" />
            Plant New Crop
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crops</CardTitle>
            <Sprout className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crops.length}</div>
            <p className="text-xs text-muted-foreground">Active in your farm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Harvest</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyCrops.length}</div>
            <p className="text-xs text-muted-foreground">
              {readyCrops.length > 0 ? "Time to harvest!" : "Keep growing!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growing</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growingCrops.length}</div>
            <p className="text-xs text-muted-foreground">Still developing</p>
          </CardContent>
        </Card>
      </div>

      {/* Crops Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Sprout className="w-4 h-4" />
            All Crops ({crops.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Ready ({readyCrops.length})
          </TabsTrigger>
          <TabsTrigger value="growing" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Growing ({growingCrops.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <CropGrid
            crops={crops}
            loading={loading}
            onHarvest={handleHarvest}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            harvestingCropId={harvestingCropId}
          />
        </TabsContent>

        <TabsContent value="ready" className="space-y-6">
          {readyCrops.length > 0 ? (
            <CropGrid
              crops={readyCrops}
              onHarvest={handleHarvest}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              harvestingCropId={harvestingCropId}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No crops ready yet</h3>
                <p className="text-muted-foreground mb-4">Your crops are still growing. Check back soon!</p>
                <Button asChild>
                  <Link href="/crops/plant">Plant More Crops</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="growing" className="space-y-6">
          {growingCrops.length > 0 ? (
            <CropGrid 
              crops={growingCrops} 
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No crops growing</h3>
                <p className="text-muted-foreground mb-4">Start planting to see your virtual farm come to life!</p>
                <Button asChild>
                  <Link href="/crops/plant">Plant Your First Crop</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
