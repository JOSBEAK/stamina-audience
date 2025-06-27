import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { SegmentType } from '../../../entities/segment.entity';

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SegmentType)
  @IsOptional()
  type: SegmentType = SegmentType.STATIC;
}

export class AddContactsToSegmentDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  contactIds: string[];
}
