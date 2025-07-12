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

interface EditCropData extends AddCropData {
  id: string
  plantedAt?: Date | string
  harvestAt?: Date | string
  nftTokenId?: string
}

// Default crop images by type
function getDefaultCropImage(type: "vegetable" | "fruit" | "grain" | "herb"): string {
  const defaultImages = {
    vegetable: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=400&fit=crop",
    fruit: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&h=400&fit=crop", 
    grain: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop",
    herb: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&h=400&fit=crop"
  }
  return defaultImages[type]
}

// API helper functions
async function fetchUserCrops(): Promise<Crop[]> {
  try {
    const response = await fetch('/api/user-crops')
    if (!response.ok) {
      throw new Error('Failed to fetch user crops')
    }
    const userCrops = await response.json()
    
    // Convert date strings back to Date objects
    return userCrops.map((crop: Omit<Crop, 'plantedAt' | 'harvestAt'> & { plantedAt: string; harvestAt: string }) => ({
      ...crop,
      plantedAt: new Date(crop.plantedAt),
      harvestAt: new Date(crop.harvestAt),
    }))
  } catch (error) {
    console.error('Error fetching user crops:', error)
    return []
  }
}

async function fetchMockCropOverrides(): Promise<Array<Crop | { id: string; deleted: boolean }>> {
  try {
    const response = await fetch('/api/mock-crops')
    if (!response.ok) {
      return []
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching mock crop overrides:', error)
    return []
  }
}

function applyMockCropOverrides(mockCrops: Crop[], overrides: Array<Crop | { id: string; deleted: boolean }>): Crop[] {
  let result = [...mockCrops]
  
  overrides.forEach(override => {
    if ('deleted' in override && override.deleted) {
      // Remove deleted crops
      result = result.filter(crop => crop.id !== override.id)
    } else {
      // Apply updates
      const cropOverride = override as Crop
      const existingIndex = result.findIndex(crop => crop.id === cropOverride.id)
      if (existingIndex >= 0) {
        result[existingIndex] = {
          ...cropOverride,
          plantedAt: new Date(cropOverride.plantedAt),
          harvestAt: new Date(cropOverride.harvestAt),
        }
      }
    }
  })
  
  return result
}

async function saveUserCrop(crop: Crop): Promise<boolean> {
  try {
    const response = await fetch('/api/user-crops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crop),
    })
    
    if (!response.ok) {
      throw new Error('Failed to save crop')
    }
    
    return true
  } catch (error) {
    console.error('Error saving crop:', error)
    return false
  }
}

async function updateUserCrop(crop: Crop): Promise<boolean> {
  try {
    const response = await fetch('/api/user-crops', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crop),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update crop')
    }
    
    return true
  } catch (error) {
    console.error('Error updating crop:', error)
    return false
  }
}

export function useCrops() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCrops = async () => {
      try {
        // Load user crops from JSON file
        const userCrops = await fetchUserCrops()
        
        // Load mock crop overrides
        const mockOverrides = await fetchMockCropOverrides()
        
        // Apply overrides to mock crops
        const modifiedMockCrops = applyMockCropOverrides(mockCrops, mockOverrides)
        
        // Combine modified mock crops with user crops
        const allCrops = [...modifiedMockCrops, ...userCrops]

        // Update maturity levels and ready status
        const updatedCrops = allCrops.map((crop) => ({
          ...crop,
          maturityLevel: calculateMaturityLevel(crop.plantedAt, crop.harvestAt),
          isReady: calculateMaturityLevel(crop.plantedAt, crop.harvestAt) >= 100,
        }))

        setCrops(updatedCrops)
        setLoading(false)
      } catch (error) {
        console.error('Error loading crops:', error)
        // Fallback to mock data if API fails
        const updatedCrops = mockCrops.map((crop) => ({
          ...crop,
          maturityLevel: calculateMaturityLevel(crop.plantedAt, crop.harvestAt),
          isReady: calculateMaturityLevel(crop.plantedAt, crop.harvestAt) >= 100,
        }))
        setCrops(updatedCrops)
        setLoading(false)
      }
    }

    loadCrops()
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
    const updatedCrop = { 
      ...crop, 
      actualYield: harvestEvent.yield, 
      isReady: false, 
      maturityLevel: 0 
    }

    // Update in JSON file if it's a user crop (not from mockData)
    const isMockCrop = mockCrops.some(mockCrop => mockCrop.id === cropId)
    if (!isMockCrop) {
      await updateUserCrop(updatedCrop)
    }

    // Update local state
    setCrops((prev) => prev.map((c) =>
      c.id === cropId ? updatedCrop : c
    ))

    return harvestEvent
  }

  const addCrop = async (cropData: AddCropData): Promise<Crop> => {
    const plantedAt = new Date()
    const harvestAt = new Date(plantedAt.getTime() + cropData.growthDuration * 24 * 60 * 60 * 1000)
    
    const newCrop: Crop = {
      id: `crop_${Date.now()}`,
      name: cropData.name,
      type: cropData.type,
      description: cropData.description,
      expectedYield: cropData.expectedYield,
      rarity: cropData.rarity,
      imageUrl: cropData.imageUrl || getDefaultCropImage(cropData.type),
      plantedAt,
      harvestAt,
      maturityLevel: 0,
      isReady: false,
      nftTokenId: `NFT${Math.floor(100 + Math.random() * 900)}`, // Generate random NFT ID
    }

    // Save to JSON file
    const saved = await saveUserCrop(newCrop)
    if (!saved) {
      throw new Error('Failed to save crop to file')
    }

    // Update local state
    setCrops(prev => [...prev, newCrop])

    return newCrop
  }

  const editCrop = async (cropData: EditCropData): Promise<Crop> => {
    const isMockCrop = mockCrops.some(mockCrop => mockCrop.id === cropData.id)
    
    const updatedCrop: Crop = {
      ...cropData,
      plantedAt: new Date(cropData.plantedAt || Date.now()),
      harvestAt: new Date(cropData.harvestAt || Date.now() + cropData.growthDuration * 24 * 60 * 60 * 1000),
      maturityLevel: calculateMaturityLevel(
        new Date(cropData.plantedAt || Date.now()),
        new Date(cropData.harvestAt || Date.now() + cropData.growthDuration * 24 * 60 * 60 * 1000)
      ),
      isReady: false,
      nftTokenId: cropData.nftTokenId || `NFT${Math.floor(100 + Math.random() * 900)}`,
    }

    let saved = false
    if (isMockCrop) {
      // Update mock crop via override
      const response = await fetch('/api/mock-crops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCrop),
      })
      saved = response.ok
    } else {
      // Update user crop
      const response = await fetch('/api/user-crops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCrop),
      })
      saved = response.ok
    }

    if (!saved) {
      throw new Error('Failed to save crop changes')
    }

    // Update local state
    setCrops(prev => prev.map(c => c.id === cropData.id ? updatedCrop : c))

    return updatedCrop
  }

  const deleteCrop = async (cropId: string): Promise<void> => {
    const isMockCrop = mockCrops.some(mockCrop => mockCrop.id === cropId)
    
    let deleted = false
    if (isMockCrop) {
      // Delete mock crop via override
      const response = await fetch(`/api/mock-crops?id=${cropId}`, {
        method: 'DELETE',
      })
      deleted = response.ok
    } else {
      // Delete user crop
      const response = await fetch(`/api/user-crops?id=${cropId}`, {
        method: 'DELETE',
      })
      deleted = response.ok
    }

    if (!deleted) {
      throw new Error('Failed to delete crop')
    }

    // Update local state
    setCrops(prev => prev.filter(c => c.id !== cropId))
  }

  return {
    crops,
    loading,
    harvestCrop,
    addCrop,
    editCrop,
    deleteCrop,
    readyCrops: crops.filter((c) => c.isReady),
    growingCrops: crops.filter((c) => !c.isReady && c.maturityLevel > 0),
  }
}
