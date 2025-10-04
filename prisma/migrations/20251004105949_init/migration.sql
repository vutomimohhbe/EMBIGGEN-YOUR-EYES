-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "opusId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instrument" TEXT,
    "filter" TEXT,
    "capturedAt" TIMESTAMP(3),
    "width" INTEGER,
    "height" INTEGER,
    "dziPath" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "userId" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "w" DOUBLE PRECISION NOT NULL,
    "h" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_opusId_key" ON "Asset"("opusId");

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
