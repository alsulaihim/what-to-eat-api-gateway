-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "ageGroup" TEXT,
ADD COLUMN     "authenticityPreference" INTEGER,
ADD COLUMN     "culturalBackground" TEXT,
ADD COLUMN     "familyStructure" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "incomeBracket" TEXT,
ADD COLUMN     "languagePreference" TEXT,
ADD COLUMN     "livingArea" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "occupationCategory" TEXT,
ADD COLUMN     "religiousDietaryRequirements" TEXT,
ADD COLUMN     "spiceToleranceLevel" INTEGER;
