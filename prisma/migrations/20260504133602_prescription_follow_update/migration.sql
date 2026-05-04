/*
  Warnings:

  - You are about to drop the column `folloUpDate` on the `prescriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "folloUpDate",
ADD COLUMN     "followUpDate" TIMESTAMP(3);
