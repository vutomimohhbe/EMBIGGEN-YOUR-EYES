import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId, x, y, w, h, title, note } = body

    const label = await prisma.label.create({
      data: {
        assetId,
        x,
        y,
        w,
        h,
        title,
        note
      }
    })

    return NextResponse.json(label)
  } catch (error) {
    console.error('Label creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 })
    }

    const labels = await prisma.label.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(labels)
  } catch (error) {
    console.error('Labels fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
