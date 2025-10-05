import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create space categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Stars' },
      update: {},
      create: {
        name: 'Stars',
        description: 'Individual stars and stellar objects',
        color: '#FFD700',
        icon: '⭐'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Galaxies' },
      update: {},
      create: {
        name: 'Galaxies',
        description: 'Galaxies and galactic structures',
        color: '#8A2BE2',
        icon: '🌌'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Nebulae' },
      update: {},
      create: {
        name: 'Nebulae',
        description: 'Gas clouds and stellar nurseries',
        color: '#FF69B4',
        icon: '🌫️'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Planets' },
      update: {},
      create: {
        name: 'Planets',
        description: 'Planetary objects and moons',
        color: '#00BFFF',
        icon: '🪐'
      }
    })
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create sample assets
  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { opusId: 'DEMO_ANDROMEDA' },
      update: {},
      create: {
        opusId: 'DEMO_ANDROMEDA',
        title: 'Andromeda Galaxy Deep Field',
        instrument: 'Wide Field Camera 3',
        filter: 'F814W',
        capturedAt: new Date('2023-01-15'),
        width: 4096,
        height: 4096,
        dziPath: '/tiles/DEMO_ANDROMEDA.dzi',
        thumbUrl: '/tiles/DEMO_ANDROMEDA_files/0/0_0.jpeg',
        meta: {
          description: 'A deep field view of the Andromeda Galaxy',
          exposure: '1200s',
          telescope: 'Hubble Space Telescope'
        }
      }
    }),
    prisma.asset.upsert({
      where: { opusId: 'DEMO_CASSINI_RINGS' },
      update: {},
      create: {
        opusId: 'DEMO_CASSINI_RINGS',
        title: 'Saturn\'s Rings - Cassini Grand Finale',
        instrument: 'Imaging Science Subsystem',
        filter: 'UV3',
        capturedAt: new Date('2017-09-15'),
        width: 2048,
        height: 2048,
        dziPath: '/ti.dzi',
        thumbUrl: '/ti_files/0/0_0.jpeg',
        meta: {
          description: 'Saturn\'s rings during the Cassini Grand Finale mission',
          exposure: '60s',
          spacecraft: 'Cassini'
        }
      }
    }),
    prisma.asset.upsert({
      where: { opusId: 'MESSIER_51' },
      update: {},
      create: {
        opusId: 'MESSIER_51',
        title: 'Messier 51 - The Whirlpool Galaxy',
        instrument: 'Wide Field Camera 3',
        filter: 'F814W, F435W, F555W',
        capturedAt: new Date('2021-05-15'),
        width: 4096,
        height: 4096,
        dziPath: '/tiles/MESSIER_51.dzi',
        thumbUrl: '/tiles/MESSIER_51_files/0/0_0.jpeg',
        meta: {
          description: 'The graceful, winding arms of the majestic spiral galaxy M51 appear like a grand spiral staircase sweeping through space. They are actually long lanes of stars and gas laced with dust.',
          exposure: '2400s',
          telescope: 'Hubble Space Telescope',
          distance: '31 million light-years',
          constellation: 'Canes Venatici',
          magnitude: '8.4',
          discovery: 'Charles Messier, 1773'
        }
      }
    })
  ])

  console.log(`✅ Created ${assets.length} assets`)

  // Create sample labels with categories
  const labels = await Promise.all([
    prisma.label.upsert({
      where: { id: 'label_1' },
      update: {},
      create: {
        id: 'label_1',
        assetId: assets[0].id,
        x: 0.3,
        y: 0.4,
        w: 0.1,
        h: 0.1,
        title: 'Star Cluster M31',
        note: 'A dense cluster of young stars in Andromeda',
        category: 'star',
        confidence: 0.95
      }
    }),
    prisma.label.upsert({
      where: { id: 'label_2' },
      update: {},
      create: {
        id: 'label_2',
        assetId: assets[0].id,
        x: 0.6,
        y: 0.7,
        w: 0.15,
        h: 0.08,
        title: 'Dust Lane',
        note: 'Dark dust lane across the galaxy',
        category: 'nebula',
        confidence: 0.87
      }
    }),
    prisma.label.upsert({
      where: { id: 'label_3' },
      update: {},
      create: {
        id: 'label_3',
        assetId: assets[1].id,
        x: 0.2,
        y: 0.3,
        w: 0.2,
        h: 0.1,
        title: 'Saturn\'s A Ring',
        note: 'Outer ring system of Saturn',
        category: 'planet',
        confidence: 0.92
      }
    }),
    // Messier 51 specific annotations
    prisma.label.upsert({
      where: { id: 'm51_spiral_arms' },
      update: {},
      create: {
        id: 'm51_spiral_arms',
        assetId: assets[2].id,
        x: 0.2,
        y: 0.3,
        w: 0.4,
        h: 0.3,
        title: 'Spiral Arms',
        note: 'The graceful, winding arms of M51 are star-formation factories, compressing hydrogen gas and creating clusters of new stars. These striking arms are a hallmark of grand-design spiral galaxies.',
        category: 'galaxy',
        confidence: 0.98
      }
    }),
    prisma.label.upsert({
      where: { id: 'm51_ngc5195' },
      update: {},
      create: {
        id: 'm51_ngc5195',
        assetId: assets[2].id,
        x: 0.7,
        y: 0.2,
        w: 0.15,
        h: 0.15,
        title: 'NGC 5195',
        note: 'The small, yellowish companion galaxy NGC 5195 is tugging on M51\'s arm, creating tidal forces that trigger new star formation. It has been gliding past the Whirlpool for hundreds of millions of years.',
        category: 'galaxy',
        confidence: 0.96
      }
    }),
    prisma.label.upsert({
      where: { id: 'm51_star_forming_regions' },
      update: {},
      create: {
        id: 'm51_star_forming_regions',
        assetId: assets[2].id,
        x: 0.4,
        y: 0.5,
        w: 0.2,
        h: 0.2,
        title: 'Star-Forming Regions',
        note: 'The red regions represent infrared light and hydrogen within giant star-forming regions. These are where new stars are being born in the spiral arms.',
        category: 'nebula',
        confidence: 0.94
      }
    }),
    prisma.label.upsert({
      where: { id: 'm51_young_stars' },
      update: {},
      create: {
        id: 'm51_young_stars',
        assetId: assets[2].id,
        x: 0.3,
        y: 0.6,
        w: 0.15,
        h: 0.15,
        title: 'Young Blue Stars',
        note: 'The blue color indicates hot, young stars that have recently formed in the spiral arms. These massive stars burn bright and hot.',
        category: 'star',
        confidence: 0.91
      }
    }),
    prisma.label.upsert({
      where: { id: 'm51_galactic_center' },
      update: {},
      create: {
        id: 'm51_galactic_center',
        assetId: assets[2].id,
        x: 0.45,
        y: 0.45,
        w: 0.1,
        h: 0.1,
        title: 'Galactic Center',
        note: 'The bright central region of M51 contains older stars and the galaxy\'s core. The yellow color indicates older stellar populations.',
        category: 'galaxy',
        confidence: 0.97
      }
    }),
    prisma.label.upsert({
      where: { id: 'm51_dust_lanes' },
      update: {},
      create: {
        id: 'm51_dust_lanes',
        assetId: assets[2].id,
        x: 0.5,
        y: 0.3,
        w: 0.25,
        h: 0.1,
        title: 'Dust Lanes',
        note: 'Dark dust lanes wind through the spiral arms, composed of cosmic dust and gas. These lanes are where new stars will eventually form.',
        category: 'nebula',
        confidence: 0.89
      }
    })
  ])

  console.log(`✅ Created ${labels.length} labels`)

  // Create sample comments
  const comments = await Promise.all([
    prisma.comment.upsert({
      where: { id: 'comment_1' },
      update: {},
      create: {
        id: 'comment_1',
        assetId: assets[0].id,
        username: 'SpaceExplorer42',
        content: 'Incredible detail in the spiral arms! The dust lanes are clearly visible.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'comment_2' },
      update: {},
      create: {
        id: 'comment_2',
        labelId: labels[0].id,
        username: 'AstroNerd',
        content: 'This star cluster shows excellent resolution. Perfect for studying stellar evolution!'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'comment_3' },
      update: {},
      create: {
        id: 'comment_3',
        assetId: assets[1].id,
        username: 'CassiniFan',
        content: 'The ring shadows are amazing! This was taken during the Grand Finale dive.'
      }
    }),
    // Additional Andromeda comments
    prisma.comment.upsert({
      where: { id: 'andromeda_comment_1' },
      update: {},
      create: {
        id: 'andromeda_comment_1',
        assetId: assets[0].id,
        username: 'GalaxyResearcher',
        content: 'Andromeda is our closest major galactic neighbor at 2.5 million light-years away. It\'s actually approaching us at 250,000 mph and will collide with the Milky Way in about 4.5 billion years!'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'andromeda_comment_2' },
      update: {},
      create: {
        id: 'andromeda_comment_2',
        assetId: assets[0].id,
        username: 'HubbleObserver',
        content: 'The resolution in this Hubble image is mind-blowing! You can see individual stars in Andromeda\'s disk. This level of detail helps us understand the structure of spiral galaxies.'
      }
    }),
    // Additional Cassini comments
    prisma.comment.upsert({
      where: { id: 'cassini_comment_1' },
      update: {},
      create: {
        id: 'cassini_comment_1',
        assetId: assets[1].id,
        username: 'PlanetaryScientist',
        content: 'The Cassini Grand Finale was one of the most dramatic missions in space exploration history! The spacecraft made 22 daring dives between Saturn and its rings before its final plunge.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'cassini_comment_2' },
      update: {},
      create: {
        id: 'cassini_comment_2',
        assetId: assets[1].id,
        username: 'RingExpert',
        content: 'Saturn\'s rings are incredibly thin - only about 10 meters thick in some places! Yet they span 175,000 miles across. It\'s like a cosmic vinyl record spinning around the planet.'
      }
    }),
    // Messier 51 specific comments
    prisma.comment.upsert({
      where: { id: 'm51_comment_1' },
      update: {},
      create: {
        id: 'm51_comment_1',
        assetId: assets[2].id,
        username: 'GalaxyHunter',
        content: 'The Whirlpool Galaxy is absolutely stunning! The interaction with NGC 5195 is clearly visible in the tidal forces affecting the spiral arms.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_2' },
      update: {},
      create: {
        id: 'm51_comment_2',
        labelId: labels[3].id, // Spiral Arms
        username: 'SpiralGalaxyExpert',
        content: 'These spiral arms are textbook examples of grand-design spirals! The star formation regions are so prominent - you can see the red HII regions where new stars are being born.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_3' },
      update: {},
      create: {
        id: 'm51_comment_3',
        labelId: labels[4].id, // NGC 5195
        username: 'GalacticDynamics',
        content: 'NGC 5195 is creating such beautiful tidal interactions! The gravitational dance between these galaxies has been going on for hundreds of millions of years.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_4' },
      update: {},
      create: {
        id: 'm51_comment_4',
        labelId: labels[6].id, // Star-Forming Regions
        username: 'StarFormationResearcher',
        content: 'The star-forming regions in the spiral arms are incredible! You can see the red hydrogen emission from the HII regions where massive stars are ionizing the surrounding gas.'
      }
    }),
    // Additional simulated conversations
    prisma.comment.upsert({
      where: { id: 'm51_comment_5' },
      update: {},
      create: {
        id: 'm51_comment_5',
        assetId: assets[2].id,
        username: 'CosmicExplorer',
        content: 'Did you know that M51 is only 31 million light-years away? That means we\'re seeing it as it was 31 million years ago! The light we see today left the galaxy when early humans were just beginning to evolve.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_6' },
      update: {},
      create: {
        id: 'm51_comment_6',
        assetId: assets[2].id,
        username: 'HubbleFan',
        content: 'The resolution in this Hubble image is incredible! You can actually see individual star clusters within the spiral arms. This level of detail helps astronomers understand how galaxies form and evolve.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_7' },
      update: {},
      create: {
        id: 'm51_comment_7',
        labelId: labels[5].id, // Young Blue Stars
        username: 'StellarAstronomer',
        content: 'Those blue stars are massive O and B type stars! They burn incredibly hot and bright, but have very short lifespans - only a few million years. They\'re the cosmic equivalent of "live fast, die young"!'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_8' },
      update: {},
      create: {
        id: 'm51_comment_8',
        assetId: assets[2].id,
        username: 'SpaceEducator',
        content: 'Fun fact: M51 was the first galaxy to be recognized as having a spiral structure! Lord Rosse observed it in 1845 with his 72-inch telescope, calling it the "Whirlpool" due to its distinctive spiral pattern.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_9' },
      update: {},
      create: {
        id: 'm51_comment_9',
        labelId: labels[7].id, // Dust Lanes
        username: 'DustLaneExpert',
        content: 'Those dark dust lanes are actually cosmic nurseries! The dust and gas in those lanes will eventually collapse under gravity to form new stars. It\'s like watching the galaxy\'s future star formation in slow motion.'
      }
    }),
    prisma.comment.upsert({
      where: { id: 'm51_comment_10' },
      update: {},
      create: {
        id: 'm51_comment_10',
        assetId: assets[2].id,
        username: 'AmateurAstronomer',
        content: 'I can actually see M51 with my 8-inch telescope from my backyard! It\'s faint but the spiral structure is visible. This Hubble image shows details that would take a telescope 1000x more powerful than mine to see clearly.'
      }
    })
  ])

  console.log(`✅ Created ${comments.length} comments`)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
