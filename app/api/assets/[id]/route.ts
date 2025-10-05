import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: { labels: false }
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Asset fetch error:', error)
    
    // Fallback mock data based on ID
    const mockAssets: { [key: string]: any } = {
      'mock-andromeda': {
        id: 'mock-andromeda',
        title: 'Andromeda Galaxy Deep Field',
        dziPath: '/tiles/DEMO_ANDROMEDA.dzi',
        thumbUrl: '/tiles/DEMO_ANDROMEDA_files/0/0_0.jpeg',
        labels: [
          {
            id: 'mock-label-1',
            title: 'Star Cluster M31',
            note: 'A dense cluster of young stars in Andromeda',
            category: 'star',
            confidence: 0.95,
            x: 0.3,
            y: 0.4,
            w: 0.1,
            h: 0.1
          }
        ]
      },
      'mock-cassini': {
        id: 'mock-cassini',
        title: 'Saturn\'s Rings - Cassini Grand Finale',
        dziPath: '/ti.dzi',
        thumbUrl: '/ti_files/0/0_0.jpeg',
        labels: [
          {
            id: 'mock-label-2',
            title: 'Saturn\'s A Ring',
            note: 'Outer ring system of Saturn',
            category: 'planet',
            confidence: 0.92,
            x: 0.2,
            y: 0.3,
            w: 0.2,
            h: 0.1
          }
        ]
      },
      'mock-m51': {
        id: 'mock-m51',
        title: 'Messier 51 - The Whirlpool Galaxy',
        dziPath: '/tiles/MESSIER_51.dzi',
        thumbUrl: '/tiles/MESSIER_51_files/0/0_0.jpeg',
        labels: [
          {
            id: 'mock-m51-1',
            title: 'Spiral Arms',
            note: 'The graceful, winding arms of M51 are star-formation factories, compressing hydrogen gas and creating clusters of new stars.',
            category: 'galaxy',
            confidence: 0.98,
            x: 0.2,
            y: 0.3,
            w: 0.4,
            h: 0.3
          },
          {
            id: 'mock-m51-2',
            title: 'NGC 5195',
            note: 'The small, yellowish companion galaxy NGC 5195 is tugging on M51\'s arm, creating tidal forces that trigger new star formation.',
            category: 'galaxy',
            confidence: 0.96,
            x: 0.7,
            y: 0.2,
            w: 0.15,
            h: 0.15
          }
        ]
      }
    }
    
    const mockAsset = mockAssets[params.id]
    if (mockAsset) {
      return NextResponse.json(mockAsset)
    }
    
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }
}
