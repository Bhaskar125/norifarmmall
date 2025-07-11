export interface User {
    id: string
    email: string
    name: string
    avatar?: string
    joinedAt: Date
    totalCrops: number
    totalHarvests: number
    level: number
    experience: number
  }
  
  export interface UserStats {
    totalCropsGrown: number
    totalHarvests: number
    totalSpent: number
    favoriteCategory: string
    currentLevel: number
    nextLevelProgress: number
  }
  