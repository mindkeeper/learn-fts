import { Controller, Get, Query } from '@nestjs/common';
import { NewsService, SearchNewsDto } from './news.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('')
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query - searches across title, description, and category names using FTS and fuzzy matching',
  })
  @ApiQuery({
    name: 'categories',
    required: false,
    description:
      'Comma-separated category slugs to filter by (e.g., technology,business)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20)',
  })
  async searchNews(
    @Query('q') q?: string,
    @Query('categories') categories?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const searchParams: SearchNewsDto = {
      q,
      categories,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.newsService.searchNews(searchParams);
  }
}
