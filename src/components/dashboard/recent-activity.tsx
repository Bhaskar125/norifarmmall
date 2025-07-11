"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprout, ShoppingCart, Trophy, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Activity {
  id: string
  type: "plant" | "harvest" | "purchase" | "level_up"
  title: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "harvest",
    title: "Harvested Golden Corn",
    description: "Successfully harvested 8.2 units with 95% quality",
    timestamp: new Date("2024-11-10T14:30:00"),
    metadata: { yield: 8.2, quality: 95 },
  },
  {
    id: "2",
    type: "purchase",
    title: "Purchased Garden Tools",
    description: "Added Premium Garden Trowel to cart",
    timestamp: new Date("2024-11-10T13:15:00"),
    metadata: { amount: 24.99 },
  },
  {
    id: "3",
    type: "plant",
    title: "Planted Fresh Basil",
    description: "Started growing a new herb crop",
    timestamp: new Date("2024-11-09T16:45:00"),
  },
  {
    id: "4",
    type: "level_up",
    title: "Level Up!",
    description: "Reached Level 5 - Experienced Farmer",
    timestamp: new Date("2024-11-08T11:20:00"),
    metadata: { newLevel: 5 },
  },
]

export function RecentActivity() {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "plant":
        return Sprout
      case "harvest":
        return Trophy
      case "purchase":
        return ShoppingCart
      case "level_up":
        return Trophy
      default:
        return Clock
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "plant":
        return "text-green-600"
      case "harvest":
        return "text-yellow-600"
      case "purchase":
        return "text-blue-600"
      case "level_up":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "plant":
        return { text: "Planted", variant: "default" as const }
      case "harvest":
        return { text: "Harvested", variant: "default" as const }
      case "purchase":
        return { text: "Purchased", variant: "secondary" as const }
      case "level_up":
        return { text: "Level Up", variant: "default" as const }
      default:
        return { text: "Activity", variant: "outline" as const }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const iconColor = getActivityColor(activity.type)
            const badge = getActivityBadge(activity.type)

            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.text}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
