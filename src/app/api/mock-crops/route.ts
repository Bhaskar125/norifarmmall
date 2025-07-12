import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Crop } from '@/types'

const MOCK_CROPS_FILE = path.join(process.cwd(), 'src/lib/mock-crops-overrides.json')

// GET - Read mock crop overrides
export async function GET() {
  try {
    if (!fs.existsSync(MOCK_CROPS_FILE)) {
      return NextResponse.json([])
    }

    const fileContent = fs.readFileSync(MOCK_CROPS_FILE, 'utf-8')
    const crops = JSON.parse(fileContent)
    
    return NextResponse.json(crops)
  } catch (error) {
    console.error('Error reading mock crop overrides:', error)
    return NextResponse.json({ error: 'Failed to read mock crop overrides' }, { status: 500 })
  }
}

// PUT - Update mock crop (save as override)
export async function PUT(request: NextRequest) {
  try {
    const updatedCrop: Crop = await request.json()
    
    // Read existing overrides
    let overrides: Crop[] = []
    if (fs.existsSync(MOCK_CROPS_FILE)) {
      const fileContent = fs.readFileSync(MOCK_CROPS_FILE, 'utf-8')
      overrides = JSON.parse(fileContent)
    }
    
    // Update or add the crop override
    const existingIndex = overrides.findIndex(crop => crop.id === updatedCrop.id)
    if (existingIndex >= 0) {
      overrides[existingIndex] = updatedCrop
    } else {
      overrides.push(updatedCrop)
    }
    
    // Write back to file
    fs.writeFileSync(MOCK_CROPS_FILE, JSON.stringify(overrides, null, 2))
    
    return NextResponse.json({ success: true, crop: updatedCrop })
  } catch (error) {
    console.error('Error updating mock crop:', error)
    return NextResponse.json({ error: 'Failed to update mock crop' }, { status: 500 })
  }
}

// DELETE - Remove mock crop (mark as deleted)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cropId = searchParams.get('id')
    
    if (!cropId) {
      return NextResponse.json({ error: 'Crop ID is required' }, { status: 400 })
    }
    
    // Read existing overrides
    let overrides: Array<Crop | { id: string; deleted: boolean }> = []
    if (fs.existsSync(MOCK_CROPS_FILE)) {
      const fileContent = fs.readFileSync(MOCK_CROPS_FILE, 'utf-8')
      overrides = JSON.parse(fileContent)
    }
    
    // Add deletion marker
    const existingIndex = overrides.findIndex(item => item.id === cropId)
    if (existingIndex >= 0) {
      overrides[existingIndex] = { id: cropId, deleted: true }
    } else {
      overrides.push({ id: cropId, deleted: true })
    }
    
    // Write back to file
    fs.writeFileSync(MOCK_CROPS_FILE, JSON.stringify(overrides, null, 2))
    
    return NextResponse.json({ success: true, message: 'Mock crop deleted successfully' })
  } catch (error) {
    console.error('Error deleting mock crop:', error)
    return NextResponse.json({ error: 'Failed to delete mock crop' }, { status: 500 })
  }
} 