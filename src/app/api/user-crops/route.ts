import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Crop } from '@/types'

const USER_CROPS_FILE = path.join(process.cwd(), 'src/lib/user-crops.json')

// GET - Read user crops from JSON file
export async function GET() {
  try {
    // Check if file exists
    if (!fs.existsSync(USER_CROPS_FILE)) {
      // Create empty file if it doesn't exist
      fs.writeFileSync(USER_CROPS_FILE, '[]')
      return NextResponse.json([])
    }

    // Read and parse the JSON file
    const fileContent = fs.readFileSync(USER_CROPS_FILE, 'utf-8')
    const crops = JSON.parse(fileContent)
    
    return NextResponse.json(crops)
  } catch (error) {
    console.error('Error reading user crops:', error)
    return NextResponse.json({ error: 'Failed to read user crops' }, { status: 500 })
  }
}

// POST - Add new crop to JSON file
export async function POST(request: NextRequest) {
  try {
    const newCrop: Crop = await request.json()
    
    // Read existing crops
    let existingCrops: Crop[] = []
    if (fs.existsSync(USER_CROPS_FILE)) {
      const fileContent = fs.readFileSync(USER_CROPS_FILE, 'utf-8')
      existingCrops = JSON.parse(fileContent)
    }

    // Add new crop
    existingCrops.push(newCrop)
    
    // Write back to file
    fs.writeFileSync(USER_CROPS_FILE, JSON.stringify(existingCrops, null, 2))
    
    return NextResponse.json({ success: true, crop: newCrop })
  } catch (error) {
    console.error('Error adding crop:', error)
    return NextResponse.json({ error: 'Failed to add crop' }, { status: 500 })
  }
}

// PUT - Update existing crop in JSON file
export async function PUT(request: NextRequest) {
  try {
    const updatedCrop: Crop = await request.json()
    
    // Read existing crops
    if (!fs.existsSync(USER_CROPS_FILE)) {
      return NextResponse.json({ error: 'No crops found' }, { status: 404 })
    }

    const fileContent = fs.readFileSync(USER_CROPS_FILE, 'utf-8')
    let crops: Crop[] = JSON.parse(fileContent)
    
    // Update the crop
    crops = crops.map(crop => 
      crop.id === updatedCrop.id ? updatedCrop : crop
    )
    
    // Write back to file
    fs.writeFileSync(USER_CROPS_FILE, JSON.stringify(crops, null, 2))
    
    return NextResponse.json({ success: true, crop: updatedCrop })
  } catch (error) {
    console.error('Error updating crop:', error)
    return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 })
  }
}

// DELETE - Remove crop from JSON file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cropId = searchParams.get('id')
    
    if (!cropId) {
      return NextResponse.json({ error: 'Crop ID is required' }, { status: 400 })
    }
    
    // Read existing crops
    if (!fs.existsSync(USER_CROPS_FILE)) {
      return NextResponse.json({ error: 'No crops found' }, { status: 404 })
    }

    const fileContent = fs.readFileSync(USER_CROPS_FILE, 'utf-8')
    let crops: Crop[] = JSON.parse(fileContent)
    
    // Find and remove the crop
    const initialLength = crops.length
    crops = crops.filter(crop => crop.id !== cropId)
    
    if (crops.length === initialLength) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 })
    }
    
    // Write back to file
    fs.writeFileSync(USER_CROPS_FILE, JSON.stringify(crops, null, 2))
    
    return NextResponse.json({ success: true, message: 'Crop deleted successfully' })
  } catch (error) {
    console.error('Error deleting crop:', error)
    return NextResponse.json({ error: 'Failed to delete crop' }, { status: 500 })
  }
} 