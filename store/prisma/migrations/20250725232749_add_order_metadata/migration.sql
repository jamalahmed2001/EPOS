-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'BONUS';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "metadata" JSONB;
