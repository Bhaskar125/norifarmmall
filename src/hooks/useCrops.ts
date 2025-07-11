"use client"

import { useState, useEffect } from "react"
import type { Crop, HarvestEvent } from "@/types"
import { mockCrops } from "@/lib/mockData"
import { calculateMaturityLevel } from "@/lib/utils"

interface AddCropData {
  name: string
  type: "vegetable" | "fruit" | "grain" | "herb"
  description: string
  expectedYield: number
  rarity: "common" | "rare" | "epic" | "legendary"
  imageUrl: string
  growthDuration: number
}

const CROPS_STORAGE_KEY = 'nori-farm-crops'

export function useCrops() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load crops from localStorage first, then fallback to mockData
    const loadCrops = () => {
      try {
        const storedCrops = localStorage.getItem(CROPS_STORAGE_KEY)
        let allCrops: Crop[] = []

                 if (storedCrops) {
           const parsedCrops = JSON.parse(storedCrops) as Array<Omit<Crop, 'plantedAt' | 'harvestAt'> & { plantedAt: string; harvestAt: string }>
           // Convert date strings back to Date objects
           allCrops = parsedCrops.map((crop) => ({
             ...crop,
             plantedAt: new Date(crop.plantedAt),
             harvestAt: new Date(crop.harvestAt),
           }))
        } else {
          // First time loading, use mock data
          allCrops = [...mockCrops]
          localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(mockCrops))
        }

        // Update maturity levels and ready status
        const updatedCrops = allCrops.map((crop) => ({
          ...crop,
          maturityLevel: calculateMaturityLevel(crop.plantedAt, crop.harvestAt),
          isReady: calculateMaturityLevel(crop.plantedAt, crop.harvestAt) >= 100,
        }))

        setCrops(updatedCrops)
        setLoading(false)
      } catch (error) {
        console.error('Error loading crops from localStorage:', error)
        // Fallback to mock data if localStorage fails
        const updatedCrops = mockCrops.map((crop) => ({
          ...crop,
          maturityLevel: calculateMaturityLevel(crop.plantedAt, crop.harvestAt),
          isReady: calculateMaturityLevel(crop.plantedAt, crop.harvestAt) >= 100,
        }))
        setCrops(updatedCrops)
        setLoading(false)
      }
    }

    // Simulate API call delay
    setTimeout(loadCrops, 1000)
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
    setCrops((prev) => {
      const updatedCrops = prev.map((c) =>
        c.id === cropId ? { ...c, actualYield: harvestEvent.yield, isReady: false, maturityLevel: 0 } : c,
      )
      // Save to localStorage
      try {
        localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(updatedCrops))
      } catch (error) {
        console.error('Error saving crops to localStorage:', error)
      }
      return updatedCrops
    })

    return harvestEvent
  }

  const addCrop = async (cropData: AddCropData): Promise<Crop> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const plantedAt = new Date()
    const harvestAt = new Date(plantedAt.getTime() + cropData.growthDuration * 24 * 60 * 60 * 1000)
    
    const newCrop: Crop = {
      id: `crop_${Date.now()}`,
      name: cropData.name,
      type: cropData.type,
      description: cropData.description,
      expectedYield: cropData.expectedYield,
      rarity: cropData.rarity,
      imageUrl: cropData.imageUrl,
      plantedAt,
      harvestAt,
      maturityLevel: 0,
      isReady: false,
      nftTokenId: `NFT${Math.floor(100 + Math.random() * 900)}`, // Generate random NFT ID
    }

    // Update local state
    setCrops(prev => {
      const updatedCrops = [...prev, newCrop]
      // Save to localStorage
      try {
        localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(updatedCrops))
      } catch (error) {
        console.error('Error saving crops to localStorage:', error)
      }
      return updatedCrops
    })

    // In a real app, you would also update the server/database here
    // await fetch('/api/crops', { method: 'POST', body: JSON.stringify(newCrop) })

    return newCrop
  }

  return {
    crops,
    loading,
    harvestCrop,
    addCrop,
    readyCrops: crops.filter((c) => c.isReady),
    growingCrops: crops.filter((c) => !c.isReady && c.maturityLevel > 0),
  }
}
