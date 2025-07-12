"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CropGrid } from "@/components/crops/crop-grid"
import { CropCard } from "@/components/crops/crop-card"
import { UserStats } from "@/components/dashboard/user-state"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { HarvestToCartWidget } from "@/components/shopping/harvest-to-cart-widget"
import { EditCropModal } from "@/components/crops/edit-crop-modal"
import { useCrops } from "@/hooks/useCrops"
import type { Crop, UserStats as UserStatsType } from "@/types"
import { Sprout, Trophy, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

const mockUserStats: UserStatsType = {
  totalCropsGrown: 12,
  totalHarvests: 8,
  totalSpent: 156.47,
  favoriteCategory: "Vegetables",
  currentLevel: 5,
  nextLevelProgress: 68,
}

export default function Dashboard() {
  const { crops, harvestCrop, editCrop, deleteCrop, readyCrops, growingCrops } = useCrops()
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

  const handleEditSave = async (cropData: Crop) => {
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
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Farmer! 🌱</h1>
          <p className="text-muted-foreground mt-1">Your virtual farm is thriving. Ready to harvest and shop?</p>
        </div>
        <Button asChild>
          <Link href="/crops/plant">
            <Plus className="w-4 h-4 mr-2" />
            Plant New Crop
          </Link>
        </Button>
      </div>

      {/* User Stats */}
      <UserStats stats={mockUserStats} />

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">Growing Crops</CardTitle>
            <Sprout className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growingCrops.length}</div>
            <p className="text-xs text-muted-foreground">Crops in development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farm Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {mockUserStats.currentLevel}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(mockUserStats.nextLevelProgress)}% to next level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ready to Harvest Section */}
      {readyCrops.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Ready to Harvest
              </CardTitle>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                {readyCrops.length} crops ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CropGrid
              crops={readyCrops}
              onHarvest={handleHarvest}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              harvestingCropId={harvestingCropId}
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Activity and Growing Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Growing Crops
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growingCrops.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {growingCrops.slice(0, 2).map((crop) => (
                  <CropCard
                    key={crop.id}
                    crop={crop}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No crops currently growing</p>
                <Button asChild className="mt-4">
                  <Link href="/crops/plant">Plant Your First Crop</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
