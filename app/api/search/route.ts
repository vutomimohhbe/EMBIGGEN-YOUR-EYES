import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    const items = await prisma.asset.findMany({
      where: q ? {
        title: {
          contains: q,
          mode: 'insensitive'
        }
      } : {},
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Search error:', error)
    
    // Fallback mock data if database is not available
    const mockItems = [
      {
        id: 'mock-andromeda',
        title: 'Andromeda Galaxy Deep Field',
        thumbUrl: '/tiles/DEMO_ANDROMEDA_files/0/0_0.jpeg',
        opusId: 'DEMO_ANDROMEDA'
      },
      {
        id: 'mock-cassini',
        title: 'Saturn\'s Rings - Cassini Grand Finale',
        thumbUrl: '/ti_files/0/0_0.jpeg',
        opusId: 'DEMO_CASSINI_RINGS'
      },
      {
        id: 'mock-m51',
        title: 'Messier 51 - The Whirlpool Galaxy',
        thumbUrl: '/tiles/MESSIER_51_files/0/0_0.jpeg',
        opusId: 'MESSIER_51'
      }
    ]
    
    const filteredItems = q ? mockItems.filter(item => 
      item.title.toLowerCase().includes(q.toLowerCase())
    ) : mockItems
    
    return NextResponse.json({ items: filteredItems })
  }
}
