import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const SORT_DIRECTIONS = ['asc', 'desc'];

export class ListParamsDto {
  @ApiPropertyOptional({
    description: 'The page number to retrieve.',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'The number of items to return per page.',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'A search term to filter results.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'The field to sort by, followed by a colon and the direction (e.g., "createdAt:desc").',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';

  @ApiPropertyOptional({
    description: 'Filter by contact role.',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by company name.',
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    description: 'Filter by location.',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter by industry.',
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Filter by folder.',
  })
  @IsOptional()
  @IsString()
  folder?: string;
}
