CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'DEBIT', 'CREDIT', 'E_WALLET');
ALTER TABLE "Transaction" ADD COLUMN "paymentMethod" "PaymentMethod";
