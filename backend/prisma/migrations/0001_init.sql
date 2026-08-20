-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "officeNumber" TEXT NOT NULL,
    "tenantName" TEXT,
    "contactNo" TEXT,
    CONSTRAINT "Office_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officeId" TEXT NOT NULL,
    "meterSerialId" TEXT NOT NULL,
    "meterType" TEXT NOT NULL DEFAULT 'ELECTRICITY',
    CONSTRAINT "Meter_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeterReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meterId" TEXT NOT NULL,
    "previousReading" REAL NOT NULL,
    "currentReading" REAL NOT NULL,
    "unitsConsumed" REAL NOT NULL,
    "imageUrl" TEXT,
    "method" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeterReading_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "Meter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "readingId" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "taxAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "dueDate" DATETIME NOT NULL,
    CONSTRAINT "Invoice_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "MeterReading" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Meter_meterSerialId_key" ON "Meter"("meterSerialId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_readingId_key" ON "Invoice"("readingId");

