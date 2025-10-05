import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test assets
    const assets = await prisma.asset.findMany()
    console.log(`📊 Found ${assets.length} assets:`)
    assets.forEach(asset => {
      console.log(`  - ${asset.title} (${asset.opusId})`)
    })
    
    // Test labels
    const labels = await prisma.label.findMany()
    console.log(`🏷️ Found ${labels.length} labels`)
    
    // Test comments
    const comments = await prisma.comment.findMany()
    console.log(`💬 Found ${comments.length} comments`)
    
    // Test categories
    const categories = await prisma.category.findMany()
    console.log(`📂 Found ${categories.length} categories`)
    
    console.log('🎉 Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
