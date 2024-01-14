/*
  Warnings:

  - You are about to drop the column `trackId` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the `Track` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Artist" DROP CONSTRAINT "Artist_trackId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_userId_fkey";

-- DropIndex
DROP INDEX "Artist_trackId_key";

-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "trackId",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasFetchedArtists" BOOLEAN,
ADD COLUMN     "topGenres" TEXT[];

-- DropTable
DROP TABLE "Track";

-- CreateIndex
CREATE UNIQUE INDEX "Artist_id_key" ON "Artist"("id");
