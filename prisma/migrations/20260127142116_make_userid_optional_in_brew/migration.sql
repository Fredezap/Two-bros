/*
  Warnings:

  - You are about to drop the `brew_ingredients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "brew_ingredients" DROP CONSTRAINT "brew_ingredients_brew_id_fkey";

-- DropTable
DROP TABLE "brew_ingredients";
