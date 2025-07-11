"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sprout, Trophy, ShoppingCart, TrendingUp } from "lucide-react"
import type { UserStats as UserStatsType } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface UserStatsProps {
  stats: UserStatsType
}

export function UserStats({ stats }: UserStatsProps) {
  const statCards = [
    {
      title: "Crops Grown",
      value: stats.totalCropsGrown,
      icon: Sprout,
      color: "text-green-600",
    },
    {
      title: "Total Harvests",
      value: stats.totalHarvests,
      icon: Trophy,
      color: "text-yellow-600",
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Current Level",
      value: stats.currentLevel,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Level Progress</CardTitle>
            <Badge variant="outline">Level {stats.currentLevel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to next level</span>
            <span className="font-medium">{Math.round(stats.nextLevelProgress)}%</span>
          </div>
          <Progress value={stats.nextLevelProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Favorite Category: {stats.favoriteCategory}</span>
            <span>Keep growing to level up!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
