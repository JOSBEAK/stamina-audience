import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AudienceListType } from '../../../entities/audience-list.entity';

export class CreateAudienceListDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AudienceListType)
  @IsOptional()
  type: AudienceListType = AudienceListType.STATIC;
}

export class AddContactsToAudienceListDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  contactIds: string[];
}
