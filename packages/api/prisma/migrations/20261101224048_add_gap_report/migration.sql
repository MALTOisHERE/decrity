-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{"protectionEnabled": true, "privacyMode": true, "notificationsEnabled": true, "alertLevel": "suspicious-and-threat", "supportedPlatforms": {"chatgpt": true, "gemini": true, "claude": true, "copilot": true}}',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentHash" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "detectionLayer" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "ScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GapReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "extensionVersion" TEXT NOT NULL,

    CONSTRAINT "GapReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "ScanResult_userId_createdAt_idx" ON "ScanResult"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ScanResult_contentHash_idx" ON "ScanResult"("contentHash");

-- CreateIndex
CREATE INDEX "ScanResult_createdAt_idx" ON "ScanResult"("createdAt");

-- CreateIndex
CREATE INDEX "GapReport_platform_createdAt_idx" ON "GapReport"("platform", "createdAt");

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
