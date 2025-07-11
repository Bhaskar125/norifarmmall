export interface Crop {
    id: string
    name: string
    type: "vegetable" | "fruit" | "grain" | "herb"
    plantedAt: Date
    harvestAt: Date
    maturityLevel: number // 0-100
    isReady: boolean
    nftTokenId?: string
    imageUrl: string
    description: string
    expectedYield: number
    actualYield?: number
    rarity: "common" | "rare" | "epic" | "legendary"
  }
  
  export interface HarvestEvent {
    id: string
    cropId: string
    harvestedAt: Date
    yield: number
    qualityScore: number
    userId: string
  }
  