"use client"

import type { Crop } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar, Sparkles, Zap } from "lucide-react"
import { formatDate, getRarityColor, getMaturityColor } from "@/lib/utils"
import Image from "next/image"

interface CropCardProps {
  crop: Crop
  onHarvest?: (cropId: string) => void
  onViewDetails?: (cropId: string) => void
  isHarvesting?: boolean
}

export function CropCard({ crop, onHarvest, onViewDetails, isHarvesting }: CropCardProps) {
  const maturityColor = getMaturityColor(crop.maturityLevel)
  const rarityColor = getRarityColor(crop.rarity)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{crop.name}</h3>
            <Badge variant="outline" className={rarityColor}>
              <Sparkles className="w-3 h-3 mr-1" />
              {crop.rarity}
            </Badge>
          </div>
          {crop.nftTokenId && (
            <Badge variant="secondary" className="text-xs">
              #{crop.nftTokenId}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image src={crop.imageUrl || "/placeholder.svg"} alt={crop.name} fill className="object-cover" />
          {crop.isReady && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 hover:bg-green-600">
                <Zap className="w-3 h-3 mr-1" />
                Ready!
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Maturity</span>
            <span className={maturityColor}>{Math.round(crop.maturityLevel)}%</span>
          </div>
          <Progress value={crop.maturityLevel} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="font-medium capitalize">{crop.type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Expected Yield</span>
            <p className="font-medium">{crop.expectedYield} units</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Harvest by {formatDate(crop.harvestAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails?.(crop.id)} className="flex-1">
          View Details
        </Button>
        {crop.isReady && (
          <Button size="sm" onClick={() => onHarvest?.(crop.id)} disabled={isHarvesting} className="flex-1">
            {isHarvesting ? "Harvesting..." : "Harvest"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
