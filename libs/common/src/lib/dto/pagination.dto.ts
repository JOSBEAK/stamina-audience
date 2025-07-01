import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Generic pagination and sorting DTO
 * Provides common query parameters for paginated API endpoints
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'The page number to retrieve (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'The number of items to return per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'A search term to filter results',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'The field to sort by, followed by a colon and the direction (e.g., "createdAt:desc")',
    default: 'createdAt:desc',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';

  /**
   * Get the offset for database queries
   *
   * @returns The calculated offset based on page and limit
   */
  getOffset(): number {
    const page = this.page ?? 1;
    const limit = this.limit ?? 10;
    return (page - 1) * limit;
  }

  /**
   * Parse the sort parameter into field and direction
   *
   * @returns Object with sortField and sortDirection
   */
  getParsedSort(): { sortField: string; sortDirection: 'ASC' | 'DESC' } {
    const sort = this.sort ?? 'createdAt:desc';
    const [field, direction] = sort.split(':');
    return {
      sortField: field || 'createdAt',
      sortDirection: (direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as
        | 'ASC'
        | 'DESC',
    };
  }
}

/**
 * Generic response wrapper for paginated data
 */
export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({
    description: 'The data items for the current page',
    type: 'array',
  })
  data!: T[];

  @ApiPropertyOptional({
    description: 'Total number of items across all pages',
  })
  total!: number;

  @ApiPropertyOptional({
    description: 'Current page number',
  })
  page!: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
  })
  limit!: number;

  @ApiPropertyOptional({
    description: 'Total number of pages',
  })
  totalPages!: number;

  @ApiPropertyOptional({
    description: 'Whether there is a next page',
  })
  hasNext!: boolean;

  @ApiPropertyOptional({
    description: 'Whether there is a previous page',
  })
  hasPrev!: boolean;

  /**
   * Create a paginated response
   *
   * @param data - The data items
   * @param total - Total count of items
   * @param pagination - The pagination parameters
   * @returns Formatted paginated response
   */
  static create<T>(
    data: T[],
    total: number,
    pagination: PaginationDto
  ): PaginatedResponseDto<T> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
