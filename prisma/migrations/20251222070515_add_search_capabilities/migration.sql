-- Enable pg_trgm extension for fuzzy/trigram matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "searchVector" tsvector;

-- Create function to update searchVector automatically
CREATE OR REPLACE FUNCTION news_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update searchVector on INSERT/UPDATE
DROP TRIGGER IF EXISTS news_search_vector_trigger ON "News";
CREATE TRIGGER news_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "News"
  FOR EACH ROW
  EXECUTE FUNCTION news_search_vector_update();

-- Update existing rows with searchVector
UPDATE "News" SET "searchVector" =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- CreateIndex
CREATE INDEX "idx_category_name_trgm" ON "Category" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_news_search_vector" ON "News" USING GIN ("searchVector");

-- CreateIndex
CREATE INDEX "idx_news_title_trgm" ON "News" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_news_description_trgm" ON "News" USING GIN ("description" gin_trgm_ops);
