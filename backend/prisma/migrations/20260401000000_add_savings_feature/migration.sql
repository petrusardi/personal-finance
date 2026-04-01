-- CreateEnum
CREATE TYPE "SavingsType" AS ENUM ('TABUNGAN', 'INVESTASI');

-- CreateEnum
CREATE TYPE "SavingsEntryType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'UPDATE');

-- CreateTable
CREATE TABLE "Savings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '💰',
    "type" "SavingsType" NOT NULL,
    "target" DECIMAL(12,2),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsEntry" (
    "id" SERIAL NOT NULL,
    "savingsId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "SavingsEntryType" NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Savings" ADD CONSTRAINT "Savings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsEntry" ADD CONSTRAINT "SavingsEntry_savingsId_fkey"
    FOREIGN KEY ("savingsId") REFERENCES "Savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsEntry" ADD CONSTRAINT "SavingsEntry_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
