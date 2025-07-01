import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@stamina-project/common';

/**
 * Contact-specific list parameters extending generic pagination
 * Adds business-specific filters for contacts
 */
export class ContactListParamsDto extends PaginationDto {
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
