import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma } from '../generated/prisma/client';

export interface SearchNewsDto {
  q?: string;
  categories?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async searchNews(params: SearchNewsDto): Promise<SearchResult> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const categorySlug = params.categories
      ? params.categories.split(',').map((slug) => slug.trim())
      : [];

    // If no search query, return paginated results with optional category filter
    if (!params.q) {
      return this.getPaginatedNews(skip, limit, categorySlug);
    }

    // Build the search query combining FTS and fuzzy matching
    const searchQuery = params.q.trim();

    // Use raw SQL for complex FTS + fuzzy matching
    const results = await this.executeSearchQuery(
      searchQuery,
      categorySlug,
      skip,
      limit,
    );

    const total = await this.getSearchCount(searchQuery, categorySlug);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async getPaginatedNews(
    skip: number,
    limit: number,
    categorySlug: string[],
  ): Promise<SearchResult> {
    const whereClause: Prisma.NewsWhereInput = {};

    if (categorySlug.length > 0) {
      whereClause.categories = {
        some: {
          category: {
            slug: {
              in: categorySlug,
            },
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.news.count({ where: whereClause }),
    ]);

    return {
      data,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async executeSearchQuery(
    searchQuery: string,
    categorySlug: string[],
    skip: number,
    limit: number,
  ): Promise<any[]> {
    // Prepare the tsquery format (replace spaces with &)
    const tsQuery = searchQuery.replace(/\s+/g, ' & ');

    // Build category filter
    const categoryFilter =
      categorySlug.length > 0
        ? Prisma.sql`
      AND EXISTS (
        SELECT 1 FROM "NewsCategoryMap" ncm
        INNER JOIN "Category" c ON c.id = ncm."categoryId"
        WHERE ncm."newsId" = n.id AND c.slug = ANY(${categorySlug})
      )
    `
        : Prisma.empty;

    // Combined FTS + Fuzzy search query
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT
        n.id,
        n.title,
        n.description,
        n."readDuration",
        n."createdAt",
        n."updatedAt",
        -- Similarity score (0.0 - 1.0 scale, combines FTS and fuzzy)
        CASE
          WHEN ts_rank(n."searchVector", to_tsquery('english', ${tsQuery})) > 0 THEN
            LEAST(
              (ts_rank(n."searchVector", to_tsquery('english', ${tsQuery})) * 0.7 +
               GREATEST(
                 similarity(n.title, ${searchQuery}),
                 similarity(COALESCE(n.description, ''), ${searchQuery})
               ) * 0.3) * 1.5,
              1.0
            )
          ELSE
            GREATEST(
              similarity(n.title, ${searchQuery}),
              similarity(COALESCE(n.description, ''), ${searchQuery})
            )
        END as similarity,
        -- FTS ranking score
        ts_rank(n."searchVector", to_tsquery('english', ${tsQuery})) as fts_rank,
        -- Individual fuzzy similarity scores
        similarity(n.title, ${searchQuery}) as title_similarity,
        similarity(COALESCE(n.description, ''), ${searchQuery}) as description_similarity,
        -- Best fuzzy score
        GREATEST(
          similarity(n.title, ${searchQuery}),
          similarity(COALESCE(n.description, ''), ${searchQuery})
        ) as fuzzy_score,
        -- Combined score (weighted: FTS 70%, Fuzzy 30%)
        (
          ts_rank(n."searchVector", to_tsquery('english', ${tsQuery})) * 0.7 +
          GREATEST(
            similarity(n.title, ${searchQuery}),
            similarity(COALESCE(n.description, ''), ${searchQuery})
          ) * 0.3
        ) as combined_score,
        -- Category data
        (
          SELECT json_agg(json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug
          ))
          FROM "NewsCategoryMap" ncm
          INNER JOIN "Category" c ON c.id = ncm."categoryId"
          WHERE ncm."newsId" = n.id
        ) as categories
      FROM "News" n
      WHERE (
        -- FTS match
        n."searchVector" @@ to_tsquery('english', ${tsQuery})
        OR
        -- Fuzzy match with similarity threshold (30%)
        similarity(n.title, ${searchQuery}) > 0.3
        OR
        similarity(COALESCE(n.description, ''), ${searchQuery}) > 0.3
        OR
        -- Also search in category names
        EXISTS (
          SELECT 1 FROM "NewsCategoryMap" ncm
          INNER JOIN "Category" c ON c.id = ncm."categoryId"
          WHERE ncm."newsId" = n.id
          AND similarity(c.name, ${searchQuery}) > 0.3
        )
      )
      ${categoryFilter}
      ORDER BY combined_score DESC, n."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    return results;
  }

  private async getSearchCount(
    searchQuery: string,
    categorySlug: string[],
  ): Promise<number> {
    const tsQuery = searchQuery.replace(/\s+/g, ' & ');

    const categoryFilter =
      categorySlug.length > 0
        ? Prisma.sql`
      AND EXISTS (
        SELECT 1 FROM "NewsCategoryMap" ncm
        INNER JOIN "Category" c ON c.id = ncm."categoryId"
        WHERE ncm."newsId" = n.id AND c.slug = ANY(${categorySlug})
      )
    `
        : Prisma.empty;

    const result = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::int as count
      FROM "News" n
      WHERE (
        n."searchVector" @@ to_tsquery('english', ${tsQuery})
        OR
        similarity(n.title, ${searchQuery}) > 0.3
        OR
        similarity(COALESCE(n.description, ''), ${searchQuery}) > 0.3
        OR
        EXISTS (
          SELECT 1 FROM "NewsCategoryMap" ncm
          INNER JOIN "Category" c ON c.id = ncm."categoryId"
          WHERE ncm."newsId" = n.id
          AND similarity(c.name, ${searchQuery}) > 0.3
        )
      )
      ${categoryFilter}
    `;

    return Number(result[0].count);
  }
}
