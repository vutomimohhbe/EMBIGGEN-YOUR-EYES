import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const labelId = searchParams.get('labelId')

    if (!assetId && !labelId) {
      return NextResponse.json({ error: 'Asset ID or Label ID required' }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        ...(assetId && { assetId }),
        ...(labelId && { labelId })
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Comments fetch error:', error)
    
    // Fallback mock comments
    const mockComments = [
      {
        id: 'mock-comment-1',
        username: 'SpaceExplorer42',
        content: 'Incredible detail in this cosmic image! The resolution is amazing.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-comment-2',
        username: 'AstroNerd',
        content: 'This is perfect for studying stellar evolution and galactic structure!',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-comment-3',
        username: 'CosmicExplorer',
        content: 'The level of detail in this image is mind-blowing! You can see individual features that would be impossible to observe from Earth.',
        createdAt: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(mockComments)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId, labelId, username, content } = body

    if (!username || !content) {
      return NextResponse.json({ error: 'Username and content required' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        assetId: assetId || null,
        labelId: labelId || null,
        username,
        content
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
