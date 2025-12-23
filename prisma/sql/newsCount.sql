-- @param {String} $1:searchQuery?
-- @param $2:categorySlug?

SELECT COUNT(*)::int as count
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
