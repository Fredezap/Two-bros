/*
  Warnings:

  - You are about to drop the column `fg` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `og` on the `recipes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "recipes" DROP COLUMN "fg",
DROP COLUMN "og";
