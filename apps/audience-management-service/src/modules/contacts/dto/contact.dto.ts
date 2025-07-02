import { ApiProperty } from '@nestjs/swagger';
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

// Properly typed related from types
export type RelatedFromValue = string | number | Record<string, unknown>;

export type RelatedFromType = {
  LEAD: 'lead';
  value: RelatedFromValue;
};

export class RelatedFrom {
  value: RelatedFromValue;
  type: RelatedFromType;
}

export type CRMLeadCustomAttributeValue = string | number | boolean | null;

export type CRMLeadCustomAttribute = {
  id: string;
  type: string;
  name: string;
  value: CRMLeadCustomAttributeValue;
};

export class CreateContactDto {
  @ApiProperty({
    description: 'The ID of the location this contact belongs to.',
    example: 'cll1y2g3d0000g9g7h3j4k5l6',
  })
  @IsString()
  @IsOptional()
  locationId: string;

  @ApiProperty({ description: 'First name of the contact', example: 'John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address of the contact',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Job title or role of the contact',
    example: 'Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Location of the contact',
    example: 'San Francisco, CA',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'URL of the avatar image',
    example: 'https://example.com/avatar.png',
  })
  @IsString()
  @IsNotEmpty()
  avatar: string;

  @ApiProperty({
    description: 'Industry of the contact',
    enum: Industry,
    required: false,
  })
  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  // Optional fields
  @ApiProperty({
    description: 'Brand ID associated with the contact',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @ApiProperty({
    description: 'List of CRM list IDs',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  crmListId?: string[];

  @ApiProperty({
    description: 'List of owner IDs',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  owners?: string[];

  @ApiProperty({ description: 'Strength score of the lead', required: false })
  @IsNumber()
  @IsOptional()
  strength?: number;

  @ApiProperty({
    description: 'Whether the contact represents a company',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCompany?: boolean;

  @ApiProperty({ description: 'Last name of the contact', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Phone number of the contact', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Status of the contact',
    required: false,
  })
  @IsObject()
  @IsOptional()
  status?: Record<string, string>;

  @ApiProperty({
    description: 'Whether the contact is tracked',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isTracked?: boolean;

  @ApiProperty({
    description: 'Timestamp of the last interaction',
    required: false,
  })
  @IsString() // Should be IsDateString in a real app
  @IsOptional()
  lastInteractionAt?: Date;

  @ApiProperty({ description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ description: 'Source of the lead', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({
    description: 'Information on related entities',
    required: false,
  })
  @IsObject()
  @IsOptional()
  relatedFrom?: RelatedFrom;

  @ApiProperty({ description: 'Role within the company', required: false })
  @IsString()
  @IsOptional()
  companyRole?: string;

  @ApiProperty({ description: 'Timezone of the contact', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ description: 'Rating of the lead', required: false })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: 'Contract value', required: false })
  @IsString()
  @IsOptional()
  contractValue?: string;

  @ApiProperty({ description: 'Currency of the contract', required: false })
  @IsString()
  @IsOptional()
  contractCurrency?: string;

  @ApiProperty({ description: 'Email bounce score', required: false })
  @IsString()
  @IsOptional()
  emailBounceScore?: string;

  @ApiProperty({ description: 'Personalized icebreaker text', required: false })
  @IsString()
  @IsOptional()
  icebreaker?: string;

  @ApiProperty({ description: 'LinkedIn profile name', required: false })
  @IsString()
  @IsOptional()
  linkedInName?: string;

  @ApiProperty({ description: 'LinkedIn provider ID', required: false })
  @IsString()
  @IsOptional()
  linkedInProviderId?: string;

  @ApiProperty({ description: 'LinkedIn company URL', required: false })
  @IsString()
  @IsOptional()
  linkedInCompanyUrl?: string;

  @ApiProperty({ description: 'Facebook profile name', required: false })
  @IsString()
  @IsOptional()
  facebookName?: string;

  @ApiProperty({ description: 'YouTube channel name', required: false })
  @IsString()
  @IsOptional()
  youtubeName?: string;

  @ApiProperty({ description: 'Instagram profile name', required: false })
  @IsString()
  @IsOptional()
  instagramName?: string;

  @ApiProperty({ description: 'Telegram username', required: false })
  @IsString()
  @IsOptional()
  telegramName?: string;

  @ApiProperty({ description: 'WhatsApp name', required: false })
  @IsString()
  @IsOptional()
  whatsappName?: string;

  @ApiProperty({ description: 'X (Twitter) profile name', required: false })
  @IsString()
  @IsOptional()
  xName?: string;

  @ApiProperty({
    description: 'X (Twitter) company profile name',
    required: false,
  })
  @IsString()
  @IsOptional()
  xCompanyName?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiProperty({
    description: 'Tags associated with the contact',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Custom attributes for the CRM lead',
    required: false,
  })
  @IsArray()
  @IsOptional()
  attributes?: CRMLeadCustomAttribute[];

  @ApiProperty({ description: 'Metadata from LinkedIn', required: false })
  @IsObject()
  @IsOptional()
  linkedInMeta?: Record<string, unknown>;
}

export class UpdateContactDto extends CreateContactDto {}
