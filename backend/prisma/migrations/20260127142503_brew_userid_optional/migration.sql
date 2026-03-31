-- DropForeignKey
ALTER TABLE "brews" DROP CONSTRAINT "brews_user_id_fkey";

-- AlterTable
ALTER TABLE "brews" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "brews" ADD CONSTRAINT "brews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
