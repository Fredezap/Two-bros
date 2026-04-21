/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id,deleted_at]` on the table `ingredients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `ingredients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ingredients_name_deleted_at_key";

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_user_id_deleted_at_key" ON "ingredients"("name", "user_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
