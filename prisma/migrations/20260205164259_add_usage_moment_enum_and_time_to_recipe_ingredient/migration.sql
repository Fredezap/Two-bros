/*
  Warnings:

  - The primary key for the `recipe_ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `usage_moment` on the `recipe_ingredients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UsageMoment" AS ENUM ('boil', 'mash', 'hopstand', 'whirlpool', 'dry_hop');

-- CreateEnum
CREATE TYPE "TimeUnit" AS ENUM ('minutes', 'days');

-- AlterTable
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_pkey",
ADD COLUMN     "time" INTEGER,
ADD COLUMN     "timeUnit" "TimeUnit",
DROP COLUMN "usage_moment",
ADD COLUMN     "usage_moment" "UsageMoment" NOT NULL,
ADD CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("recipe_id", "ingredient_id", "usage_moment");
