CREATE TABLE "UserProfile" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "displayName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssetCategory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Asset" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "symbol" TEXT,
  "categoryId" TEXT NOT NULL,
  "strategyRole" TEXT NOT NULL DEFAULT 'CORE',
  "estimatedValue" DECIMAL(65,30),
  "targetWeight" DECIMAL(65,30),
  "note" TEXT,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Investment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "tradeDate" TIMESTAMP(3) NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "quantity" DECIMAL(65,30),
  "price" DECIMAL(65,30),
  "fee" DECIMAL(65,30),
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PortfolioSnapshot" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "snapshotDate" TIMESTAMP(3) NOT NULL,
  "totalValue" DECIMAL(65,30) NOT NULL,
  "principal" DECIMAL(65,30) NOT NULL,
  "profit" DECIMAL(65,30) NOT NULL,
  "roi" DECIMAL(65,30) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvestmentGoal" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "targetDate" TIMESTAMP(3) NOT NULL,
  "targetAmount" DECIMAL(65,30) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InvestmentGoal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssetCategory_id_userId_key" ON "AssetCategory"("id", "userId");
CREATE UNIQUE INDEX "AssetCategory_userId_name_key" ON "AssetCategory"("userId", "name");
CREATE INDEX "AssetCategory_userId_idx" ON "AssetCategory"("userId");

CREATE UNIQUE INDEX "Asset_id_userId_key" ON "Asset"("id", "userId");
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");
CREATE INDEX "Asset_userId_categoryId_idx" ON "Asset"("userId", "categoryId");
CREATE INDEX "Asset_userId_strategyRole_idx" ON "Asset"("userId", "strategyRole");

CREATE UNIQUE INDEX "Investment_id_userId_key" ON "Investment"("id", "userId");
CREATE INDEX "Investment_userId_idx" ON "Investment"("userId");
CREATE INDEX "Investment_userId_assetId_idx" ON "Investment"("userId", "assetId");
CREATE INDEX "Investment_userId_tradeDate_idx" ON "Investment"("userId", "tradeDate");
CREATE INDEX "Investment_userId_type_idx" ON "Investment"("userId", "type");

CREATE UNIQUE INDEX "PortfolioSnapshot_id_userId_key" ON "PortfolioSnapshot"("id", "userId");
CREATE UNIQUE INDEX "PortfolioSnapshot_userId_snapshotDate_key" ON "PortfolioSnapshot"("userId", "snapshotDate");
CREATE INDEX "PortfolioSnapshot_userId_snapshotDate_idx" ON "PortfolioSnapshot"("userId", "snapshotDate");

CREATE UNIQUE INDEX "InvestmentGoal_id_userId_key" ON "InvestmentGoal"("id", "userId");
CREATE INDEX "InvestmentGoal_userId_targetDate_idx" ON "InvestmentGoal"("userId", "targetDate");

ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_userId_fkey"
  FOREIGN KEY ("categoryId", "userId") REFERENCES "AssetCategory"("id", "userId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Investment" ADD CONSTRAINT "Investment_assetId_userId_fkey"
  FOREIGN KEY ("assetId", "userId") REFERENCES "Asset"("id", "userId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
