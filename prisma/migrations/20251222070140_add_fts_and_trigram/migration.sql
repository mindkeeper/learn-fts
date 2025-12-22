-- Enable pg_trgm extension for fuzzy/trigram matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add tsvector column for full-text search on News table
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- Create function to update search_vector automatically
CREATE OR REPLACE FUNCTION news_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search_vector on INSERT/UPDATE
DROP TRIGGER IF EXISTS news_search_vector_trigger ON "News";
CREATE TRIGGER news_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "News"
  FOR EACH ROW
  EXECUTE FUNCTION news_search_vector_update();

-- Update existing rows with search_vector
UPDATE "News" SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_news_search_vector ON "News" USING GIN(search_vector);

-- Create GIN indexes for trigram fuzzy matching on title and description
CREATE INDEX IF NOT EXISTS idx_news_title_trgm ON "News" USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_news_description_trgm ON "News" USING GIN(description gin_trgm_ops);

-- Create index on Category name for trigram matching
CREATE INDEX IF NOT EXISTS idx_category_name_trgm ON "Category" USING GIN(name gin_trgm_ops);
