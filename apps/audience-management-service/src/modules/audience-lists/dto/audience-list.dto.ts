import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AudienceListType } from '../../../entities/audience-list.entity';

export class CreateAudienceListDto {
  @ApiProperty({
    description: 'Name of the audience list',
    example: 'High-Value Customers',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Type of the audience list',
    enum: AudienceListType,
    example: AudienceListType.STATIC,
    default: AudienceListType.STATIC,
  })
  @IsEnum(AudienceListType)
  @IsOptional()
  type: AudienceListType = AudienceListType.STATIC;
}

export class AddContactsToAudienceListDto {
  @ApiProperty({
    description: 'Array of contact UUIDs to add to the audience list',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  contactIds: string[];
}
