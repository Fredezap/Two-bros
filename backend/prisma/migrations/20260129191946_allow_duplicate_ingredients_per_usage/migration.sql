/*
  Warnings:

  - The primary key for the `recipe_ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_pkey",
ADD CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("recipe_id", "ingredient_id", "usage_moment");
