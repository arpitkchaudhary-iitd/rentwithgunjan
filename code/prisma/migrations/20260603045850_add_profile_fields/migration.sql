-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "householdStatus" TEXT,
ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredContact" TEXT,
ADD COLUMN     "preferredNeighborhood" TEXT,
ADD COLUMN     "propertyTypeInterest" TEXT,
ADD COLUMN     "realEstateInterest" BOOLEAN NOT NULL DEFAULT false;
