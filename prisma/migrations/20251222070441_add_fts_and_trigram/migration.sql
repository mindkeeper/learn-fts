/*
  Warnings:

  - You are about to drop the column `search_vector` on the `News` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_category_name_trgm";

-- DropIndex
DROP INDEX "idx_news_description_trgm";

-- DropIndex
DROP INDEX "idx_news_search_vector";

-- DropIndex
DROP INDEX "idx_news_title_trgm";

-- AlterTable
ALTER TABLE "News" DROP COLUMN "search_vector";
