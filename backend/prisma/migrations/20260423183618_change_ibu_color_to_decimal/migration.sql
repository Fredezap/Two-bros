/*
  Warnings:

  - You are about to alter the column `ibu` on the `recipes` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `color_srm` on the `recipes` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "recipes" ALTER COLUMN "ibu" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "color_srm" SET DATA TYPE DECIMAL(5,2);
