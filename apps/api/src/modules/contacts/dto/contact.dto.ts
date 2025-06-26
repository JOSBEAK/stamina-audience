import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Industry } from '@stamina-project/types';

// These types are not defined, so we will use a generic 'any' type for now.
type RelatedFrom = any;
type CRMLeadCustomAttribute = any;

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  avatar: string;

  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  // Optional fields
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @IsArray()
  @IsOptional()
  crmListId?: string[];

  @IsArray()
  @IsOptional()
  owners?: string[];

  @IsNumber()
  @IsOptional()
  strength?: number;

  @IsBoolean()
  @IsOptional()
  isCompany?: boolean;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  status?: Record<string, string>;

  @IsBoolean()
  @IsOptional()
  isTracked?: boolean;

  @IsString() // Should be IsDateString in a real app
  @IsOptional()
  lastInteractionAt?: Date;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsObject()
  @IsOptional()
  relatedFrom?: RelatedFrom;

  @IsString()
  @IsOptional()
  companyRole?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  contractValue?: string;

  @IsString()
  @IsOptional()
  contractCurrency?: string;

  @IsString()
  @IsOptional()
  emailBounceScore?: string;

  @IsString()
  @IsOptional()
  icebreaker?: string;

  @IsString()
  @IsOptional()
  linkedInName?: string;

  @IsString()
  @IsOptional()
  linkedInProviderId?: string;

  @IsString()
  @IsOptional()
  linkedInCompanyUrl?: string;

  @IsString()
  @IsOptional()
  facebookName?: string;

  @IsString()
  @IsOptional()
  youtubeName?: string;

  @IsString()
  @IsOptional()
  instagramName?: string;

  @IsString()
  @IsOptional()
  telegramName?: string;

  @IsString()
  @IsOptional()
  whatsappName?: string;

  @IsString()
  @IsOptional()
  xName?: string;

  @IsString()
  @IsOptional()
  xCompanyName?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  attributes?: CRMLeadCustomAttribute[];

  @IsObject()
  @IsOptional()
  linkedInMeta?: Record<string, any>;
}

export class UpdateContactDto extends CreateContactDto {}
