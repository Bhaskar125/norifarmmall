"use client"

import { useState, useEffect } from "react"
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
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Save, Upload, Trash2 } from "lucide-react"
import type { Crop } from "@/types"

interface EditCropData {
  id: string
  name: string
  type: "vegetable" | "fruit" | "grain" | "herb"
  description: string
  expectedYield: number
  rarity: "common" | "rare" | "epic" | "legendary"
  imageUrl: string
  growthDuration: number
  plantedAt: Date
  harvestAt: Date
  nftTokenId?: string
}

interface EditCropModalProps {
  crop: Crop
  isOpen: boolean
  onClose: () => void
  onSave: (cropData: EditCropData) => Promise<void>
  onDelete?: (cropId: string) => Promise<void>
}

interface ImageUploadResult {
  success: boolean
  imageUrl: string
  filename: string
  originalName: string
  size: number
  type: string
}

const cropTypeOptions = [
  { value: "vegetable", label: "Vegetable 🥕" },
  { value: "fruit", label: "Fruit 🍎" },
  { value: "grain", label: "Grain 🌾" },
  { value: "herb", label: "Herb 🌿" },
]

const rarityOptions = [
  { value: "common", label: "Common", color: "bg-gray-100 text-gray-800" },
  { value: "rare", label: "Rare", color: "bg-blue-100 text-blue-800" },
  { value: "epic", label: "Epic", color: "bg-purple-100 text-purple-800" },
  { value: "legendary", label: "Legendary", color: "bg-yellow-100 text-yellow-800" },
]

export function EditCropModal({ crop, isOpen, onClose, onSave, onDelete }: EditCropModalProps) {
  const [formData, setFormData] = useState({
    id: crop.id,
    name: crop.name,
    type: crop.type,
    description: crop.description,
    expectedYield: crop.expectedYield,
    rarity: crop.rarity,
    imageUrl: crop.imageUrl,
    growthDuration: Math.ceil((crop.harvestAt.getTime() - crop.plantedAt.getTime()) / (24 * 60 * 60 * 1000)),
    plantedAt: crop.plantedAt,
    harvestAt: crop.harvestAt,
    nftTokenId: crop.nftTokenId,
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset form when crop changes
  useEffect(() => {
    setFormData({
      id: crop.id,
      name: crop.name,
      type: crop.type,
      description: crop.description,
      expectedYield: crop.expectedYield,
      rarity: crop.rarity,
      imageUrl: crop.imageUrl,
      growthDuration: Math.ceil((crop.harvestAt.getTime() - crop.plantedAt.getTime()) / (24 * 60 * 60 * 1000)),
      plantedAt: crop.plantedAt,
      harvestAt: crop.harvestAt,
      nftTokenId: crop.nftTokenId,
    })
  }, [crop])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress("Uploading image...")

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formDataUpload,
      })

      const result: ImageUploadResult = await response.json()

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.imageUrl
        }))
        setUploadProgress(`✅ Uploaded: ${result.originalName}`)
      } else {
        setUploadProgress("❌ Upload failed")
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress("❌ Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save crop. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (!confirm(`Are you sure you want to delete "${crop.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(crop.id)
      onClose()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete crop. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Edit Crop</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crop Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Crop Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          {/* Crop Type */}
          <div className="space-y-2">
            <Label>Crop Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cropTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Expected Yield and Rarity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yield">Expected Yield</Label>
              <Input
                id="yield"
                type="number"
                min="1"
                max="100"
                value={formData.expectedYield}
                onChange={(e) => handleInputChange("expectedYield", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rarity</Label>
              <Select value={formData.rarity} onValueChange={(value) => handleInputChange("rarity", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rarityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={option.color}>{option.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Crop Image</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Upload New Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    {isUploading && (
                      <div className="text-sm text-blue-600">
                        <Upload className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  {uploadProgress && (
                    <p className="text-sm text-muted-foreground">{uploadProgress}</p>
                  )}
                </div>
                
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Or Enter Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    disabled={isUploading}
                  />
                </div>
              </div>
              
              {/* Image Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
                  {formData.imageUrl ? (
                    <img 
                      src={formData.imageUrl} 
                      alt="Crop preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🌱</div>
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <div>
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isDeleting || isUploading}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 