-- AlterTable
ALTER TABLE "Recording" ADD COLUMN     "variables" JSONB[] DEFAULT ARRAY[]::JSONB[];
