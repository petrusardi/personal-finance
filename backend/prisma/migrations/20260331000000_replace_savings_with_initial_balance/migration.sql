DROP TABLE IF EXISTS "SavingsEntry";

CREATE TABLE "InitialBalance" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "InitialBalance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InitialBalance_userId_key" ON "InitialBalance"("userId");

ALTER TABLE "InitialBalance" ADD CONSTRAINT "InitialBalance_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
