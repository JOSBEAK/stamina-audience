import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@stamina-project/common';

/**
 * Audience list specific list parameters extending generic pagination
 * Adds folder filtering for audience lists
 */
export class AudienceListParamsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by folder.',
  })
  @IsOptional()
  @IsString()
  folder?: string;
}
