
CREATE EXTENSION IF NOT EXISTS postgis;
-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "location" Geometry(Point, 4326);
