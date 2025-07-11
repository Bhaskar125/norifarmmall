"use client"

import { useState, useEffect } from "react"
import type { Crop, HarvestEvent } from "@/types"
import { mockCrops } from "@/lib/mockData"
import { calculateMaturityLevel } from "@/lib/utils"

export function useCrops() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const updatedCrops = mockCrops.map((crop) => ({
        ...crop,
        maturityLevel: calculateMaturityLevel(crop.plantedAt, crop.harvestAt),
        isReady: calculateMaturityLevel(crop.plantedAt, crop.harvestAt) >= 100,
      }))
      setCrops(updatedCrops)
      setLoading(false)
    }, 1000)
  }, [])

  const harvestCrop = async (cropId: string): Promise<HarvestEvent> => {
    const crop = crops.find((c) => c.id === cropId)
    if (!crop || !crop.isReady) {
      throw new Error("Crop is not ready for harvest")
    }

    // Simulate harvest
    const harvestEvent: HarvestEvent = {
      id: `harvest_${Date.now()}`,
      cropId,
      harvestedAt: new Date(),
      yield: crop.expectedYield + Math.random() * 2 - 1, // Some variance
      qualityScore: 80 + Math.random() * 20,
      userId: "1",
    }

    // Update crop status
    setCrops((prev) =>
      prev.map((c) =>
        c.id === cropId ? { ...c, actualYield: harvestEvent.yield, isReady: false, maturityLevel: 0 } : c,
      ),
    )

    return harvestEvent
  }

  return {
    crops,
    loading,
    harvestCrop,
    readyCrops: crops.filter((c) => c.isReady),
    growingCrops: crops.filter((c) => !c.isReady && c.maturityLevel > 0),
  }
}
