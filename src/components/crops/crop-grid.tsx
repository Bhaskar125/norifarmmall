"use client"

import type { Crop } from "@/types"
import { CropCard } from "./crop-card"
import { Loading } from "@/components/ui/loading"

interface CropGridProps {
  crops: Crop[]
  loading?: boolean
  onHarvest?: (cropId: string) => void
  onViewDetails?: (cropId: string) => void
  onEdit?: (crop: Crop) => void
  onDelete?: (cropId: string) => void
  harvestingCropId?: string
}

export function CropGrid({ crops, loading, onHarvest, onViewDetails, onEdit, onDelete, harvestingCropId }: CropGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading your crops..." />
      </div>
    )
  }

  if (crops.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No crops found</p>
          <p className="text-sm">Start planting to see your virtual farm grow!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {crops.map((crop) => (
        <CropCard
          key={crop.id}
          crop={crop}
          onHarvest={onHarvest}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          isHarvesting={harvestingCropId === crop.id}
        />
      ))}
    </div>
  )
}
