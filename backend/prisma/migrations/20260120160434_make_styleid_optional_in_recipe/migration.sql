/*
  Warnings:

  - You are about to alter the column `name` on the `styles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_style_id_fkey";

-- AlterTable
ALTER TABLE "recipes" ALTER COLUMN "style_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "styles" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "styles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
