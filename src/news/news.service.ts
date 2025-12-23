import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { news, newsCount } from '../generated/prisma/sql';

export interface SearchNewsDto {
  q?: string;
  categories?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: news.Result[];
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
    const offset = (page - 1) * limit;
    const categorySlug = params.categories
      ? params.categories.split(',').map((slug) => slug.trim())
      : [];

    // Prepare search query (null if not searching, formatted if searching)
    const searchQuery = params.q
      ? params.q.trim().replace(/\s+/g, ' & ')
      : null;

    // Execute both queries in parallel
    const [results, countResult] = await Promise.all([
      this.prisma.$queryRawTyped(
        news(
          searchQuery,
          categorySlug.length > 0 ? categorySlug : null,
          limit,
          offset,
        ),
      ),
      this.prisma.$queryRawTyped(
        newsCount(searchQuery, categorySlug.length > 0 ? categorySlug : null),
      ),
    ]);

    const total = countResult[0].count ?? 0;

    return {
      data: results.map((result) => ({
        ...result,
        categories: result.categories || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
