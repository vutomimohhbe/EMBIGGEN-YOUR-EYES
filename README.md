
# Embiggen your eyes - Data imaging tool 

![Embiggen Your Eyes Logo](./logo.png)
While your cell phone screen can display about three million pixels of information and your eye can receive more than ten million pixels, NASA images from space are even bigger! NASA’s space missions continue to push the boundaries of what is technologically possible, providing high-resolution images and videos of Earth, other planets, and space with billions or even trillions of pixels. 

## Features

- 🔍 Deep zoom image viewer using OpenSeadragon
- 🏷️ Interactive labeling and annotation system
- 🔍 Search functionality for astronomical assets
- 📊 Database-driven asset management with Prisma
- 🎨 Modern UI with Tailwind CSS


## Usage


## Setup

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Set up the database:**
   ```bash
   npm run setup
   ```
   This will:
   - Generate Prisma client
   - Push database schema
   - Seed with sample data

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database
- `npm run setup` - Complete database setup

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── explore/       # Image exploration pages
│   └── lib/           # Utilities (Prisma client)
├── prisma/            # Database schema and migrations
├── public/            # Static assets and image tiles
├── scripts/           # Database seeding scripts
└── docker-compose.yml # Database configuration
```

## Database

The application uses PostgreSQL with Prisma ORM. The database includes:

- **Assets**: Astronomical images with metadata
- **Labels**: Annotations and markers on images

## Image Tiles

The application supports Deep Zoom Image (DZI) format for high-resolution image viewing. Sample tiles are included in the `public/tiles/` directory.

## Tech stack
The application is built with:
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- OpenSeadragon for image viewing
- PostgreSQL database

## Contributions
This is the team which from the left: Vutomi and right: Bonga

![team_pic](./ar_team.png)
