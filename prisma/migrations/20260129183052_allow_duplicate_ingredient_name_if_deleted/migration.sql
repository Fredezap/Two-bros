/*
  Warnings:

  - A unique constraint covering the columns `[name,deleted_at]` on the table `ingredients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ingredients_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_deleted_at_key" ON "ingredients"("name", "deleted_at");
