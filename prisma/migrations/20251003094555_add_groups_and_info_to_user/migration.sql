/*
  Warnings:

  - Added the required column `groups` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `info` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Role" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Role_id_seq";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "groups" INTEGER NOT NULL,
ADD COLUMN     "info" TEXT NOT NULL;
