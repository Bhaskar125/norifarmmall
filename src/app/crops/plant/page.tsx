"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Sprout, ArrowLeft, Calendar, Sparkles, Info } from "lucide-react"
import Link from "next/link"
import { useCrops } from "@/hooks/useCrops"

interface PlantCropForm {
  name: string
  type: "vegetable" | "fruit" | "grain" | "herb" | ""
  description: string
  expectedYield: number
  rarity: "common" | "rare" | "epic" | "legendary" | ""
  imageUrl: string
  growthDuration: number // in days
}

const cropTypeOptions = [
  { value: "vegetable", label: "Vegetable 🥕", description: "Root vegetables, leafy greens, etc." },
  { value: "fruit", label: "Fruit 🍎", description: "Tree fruits, berries, citrus" },
  { value: "grain", label: "Grain 🌾", description: "Wheat, corn, rice, oats" },
  { value: "herb", label: "Herb 🌿", description: "Culinary and medicinal herbs" },
]

const rarityOptions = [
  { value: "common", label: "Common", color: "bg-gray-100 text-gray-800", growth: "70-90 days" },
  { value: "rare", label: "Rare", color: "bg-blue-100 text-blue-800", growth: "90-120 days" },
  { value: "epic", label: "Epic", color: "bg-purple-100 text-purple-800", growth: "120-150 days" },
  { value: "legendary", label: "Legendary", color: "bg-yellow-100 text-yellow-800", growth: "150+ days" },
]

const defaultGrowthDurations = {
  vegetable: 75,
  fruit: 120,
  grain: 100,
  herb: 45,
}

export default function PlantCropPage() {
  const router = useRouter()
  const { addCrop } = useCrops()
  const [isPlanting, setIsPlanting] = useState(false)
  const [formData, setFormData] = useState<PlantCropForm>({
    name: "",
    type: "",
    description: "",
    expectedYield: 5,
    rarity: "",
    imageUrl: "",
    growthDuration: 75,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof PlantCropForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Auto-adjust growth duration based on type
    if (field === "type" && value !== "") {
      const duration = defaultGrowthDurations[value as keyof typeof defaultGrowthDurations]
      setFormData(prev => ({
        ...prev,
        growthDuration: duration
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Crop name is required"
    }
    if (!formData.type) {
      newErrors.type = "Crop type is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!formData.rarity) {
      newErrors.rarity = "Rarity is required"
    }
    if (formData.expectedYield < 1 || formData.expectedYield > 100) {
      newErrors.expectedYield = "Expected yield must be between 1 and 100"
    }
    if (formData.growthDuration < 1 || formData.growthDuration > 365) {
      newErrors.growthDuration = "Growth duration must be between 1 and 365 days"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePlantCrop = async () => {
    if (!validateForm()) return

    setIsPlanting(true)
    try {
      await addCrop({
        name: formData.name.trim(),
        type: formData.type as "vegetable" | "fruit" | "grain" | "herb",
        description: formData.description.trim(),
        expectedYield: formData.expectedYield,
        rarity: formData.rarity as "common" | "rare" | "epic" | "legendary",
        imageUrl: formData.imageUrl || "/placeholder.svg?height=200&width=200",
        growthDuration: formData.growthDuration,
      })

      // Show success message
      alert(`🌱 Successfully planted ${formData.name}! It will be ready to harvest in ${formData.growthDuration} days. You can now find it in the crop matcher and your farm dashboard.`)
      
      // Redirect to crops page
      router.push("/crops")
    } catch (error) {
      console.error("Failed to plant crop:", error)
      alert("Failed to plant crop. Please try again.")
    } finally {
      setIsPlanting(false)
    }
  }

  const selectedRarity = rarityOptions.find(r => r.value === formData.rarity)

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crops">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600" />
            Plant New Crop
          </h1>
          <p className="text-muted-foreground mt-1">Create a new virtual crop for your farm</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crop Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Crop Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Heritage Tomatoes, Dragon Fruit Cactus"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Crop Type */}
          <div className="space-y-2">
            <Label>Crop Type *</Label>
            <Select value={formData.type} onValueChange={(value: string) => handleInputChange("type", value)}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select crop type" />
              </SelectTrigger>
              <SelectContent>
                {cropTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your crop's unique characteristics, flavor, or special properties..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <Separator />

          {/* Growth Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expected Yield */}
            <div className="space-y-2">
              <Label htmlFor="yield">Expected Yield *</Label>
              <Input
                id="yield"
                type="number"
                min="1"
                max="100"
                value={formData.expectedYield}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("expectedYield", parseInt(e.target.value) || 0)}
                className={errors.expectedYield ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">Units of harvest (1-100)</p>
              {errors.expectedYield && (
                <p className="text-sm text-red-600">{errors.expectedYield}</p>
              )}
            </div>

            {/* Growth Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Growth Duration *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={formData.growthDuration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("growthDuration", parseInt(e.target.value) || 0)}
                className={errors.growthDuration ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">Days until harvest (1-365)</p>
              {errors.growthDuration && (
                <p className="text-sm text-red-600">{errors.growthDuration}</p>
              )}
            </div>
          </div>

          {/* Rarity */}
          <div className="space-y-2">
            <Label>Rarity *</Label>
            <Select value={formData.rarity} onValueChange={(value: string) => handleInputChange("rarity", value)}>
              <SelectTrigger className={errors.rarity ? "border-red-500" : ""}>
                <SelectValue placeholder="Select rarity level" />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={option.color}>{option.label}</Badge>
                      <span className="text-sm text-muted-foreground">({option.growth})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rarity && (
              <p className="text-sm text-red-600">{errors.rarity}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/crop-image.jpg"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to use default placeholder image
            </p>
          </div>

          <Separator />

          {/* Summary */}
          {formData.name && formData.type && formData.rarity && (
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-green-800">Planting Summary</h4>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Crop:</strong> {formData.name} ({formData.type})</p>
                <p><strong>Rarity:</strong> {selectedRarity && (
                  <Badge className={`ml-1 ${selectedRarity.color}`}>
                    {selectedRarity.label}
                  </Badge>
                )}</p>
                <p><strong>Expected Yield:</strong> {formData.expectedYield} units</p>
                <p><strong>Time to Harvest:</strong> {formData.growthDuration} days</p>
                <p className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <strong>Harvest Date:</strong> {new Date(Date.now() + formData.growthDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/crops">Cancel</Link>
        </Button>
        <Button 
          onClick={handlePlantCrop} 
          disabled={isPlanting || !formData.name || !formData.type || !formData.rarity}
          className="min-w-32"
        >
          {isPlanting ? (
            <>
              <Sprout className="w-4 h-4 mr-2 animate-spin" />
              Planting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Plant Crop
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 