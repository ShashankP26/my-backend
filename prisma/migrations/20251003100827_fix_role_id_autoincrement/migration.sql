-- AlterTable
CREATE SEQUENCE "public".role_id_seq;
ALTER TABLE "public"."Role" ALTER COLUMN "id" SET DEFAULT nextval('"public".role_id_seq');
ALTER SEQUENCE "public".role_id_seq OWNED BY "public"."Role"."id";
