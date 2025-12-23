-- @param {String} $1:searchQuery?
-- @param $2:categorySlug?
-- @param {Int} $3:limit
-- @param {Int} $4:offset

SELECT
  n.id,
  n.title,
  n.description,
  n."readDuration",
  n."createdAt",
  n."updatedAt",
  -- Metrics (null when no search query)
  CASE WHEN $1::text IS NOT NULL THEN
    CASE
      WHEN ts_rank(n."searchVector", to_tsquery('english', $1::text)) > 0 THEN
        LEAST((ts_rank(n."searchVector", to_tsquery('english', $1::text)) * 0.7 +
               GREATEST(similarity(n.title, $1::text), similarity(COALESCE(n.description, ''), $1::text)) * 0.3) * 1.5, 1.0)
      ELSE
        GREATEST(similarity(n.title, $1::text), similarity(COALESCE(n.description, ''), $1::text))
    END
  ELSE NULL END as similarity,
  CASE WHEN $1::text IS NOT NULL THEN ts_rank(n."searchVector", to_tsquery('english', $1::text)) ELSE NULL END as "ftsRank",
  -- Categories as JSON array
  (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
   FROM "NewsCategoryMap" ncm
   INNER JOIN "Category" c ON c.id = ncm."categoryId"
   WHERE ncm."newsId" = n.id) as categories
FROM "News" n
WHERE
  -- Search conditions (only when searchQuery provided)
  ($1::text IS NULL OR (
    n."searchVector" @@ to_tsquery('english', $1::text)
    OR similarity(n.title, $1::text) > 0.3
    OR similarity(COALESCE(n.description, ''), $1::text) > 0.3
  ))
  -- Category filter
  AND (array_length($2::text[], 1) IS NULL OR EXISTS (
    SELECT 1 FROM "NewsCategoryMap" ncm
    INNER JOIN "Category" c ON c.id = ncm."categoryId"
    WHERE ncm."newsId" = n.id AND c.slug = ANY($2)
  ))
ORDER BY
  CASE WHEN $1::text IS NOT NULL THEN
    (ts_rank(n."searchVector", to_tsquery('english', $1::text)) * 0.7 +
     GREATEST(similarity(n.title, $1::text), similarity(COALESCE(n.description, ''), $1::text)) * 0.3)
  ELSE 0 END DESC,
  n."createdAt" DESC
LIMIT $3
OFFSET $4
