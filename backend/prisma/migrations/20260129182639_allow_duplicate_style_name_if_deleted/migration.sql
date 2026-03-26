/*
  Warnings:

  - A unique constraint covering the columns `[name,deleted_at]` on the table `styles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "styles_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "styles_name_deleted_at_key" ON "styles"("name", "deleted_at");
