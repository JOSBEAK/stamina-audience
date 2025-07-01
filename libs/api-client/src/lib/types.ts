// Local type definitions for API client that match @stamina-project/types exactly

export enum Industry {
  TECHNOLOGY = 'Technology',
  HEALTHCARE = 'Healthcare',
  FINANCE = 'Finance',
  EDUCATION = 'Education',
  RETAIL = 'Retail',
  MANUFACTURING = 'Manufacturing',
  AUTOMOTIVE = 'Automotive',
  HOSPITALITY = 'Hospitality',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other',
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  avatar: string;
  industry?: Industry | null;
  brandId?: string | null;
  crmListId?: string[] | null;
  owners?: string[] | null;
  strength?: number | null;
  isCompany?: boolean | null;
  lastName?: string | null;
  phone?: string | null;
  status?: Record<string, string> | null;
  isTracked?: boolean | null;
  lastInteractionAt?: Date | null;
  company?: string | null;
  source?: string | null;
  companyRole?: string | null;
  timezone?: string | null;
  rating?: number | null;
  contractValue?: string | null;
  contractCurrency?: string | null;
  emailBounceScore?: string | null;
  icebreaker?: string | null;
  linkedInName?: string | null;
  linkedInProviderId?: string | null;
  linkedInCompanyUrl?: string | null;
  facebookName?: string | null;
  youtubeName?: string | null;
  instagramName?: string | null;
  telegramName?: string | null;
  whatsappName?: string | null;
  xName?: string | null;
  xCompanyName?: string | null;
  websiteUrl?: string | null;
  tags?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudienceList {
  id: string;
  name: string;
  type: 'static' | 'dynamic';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  memberCount?: number;
  usedInCount?: number;
  creator?: string | null;
  folder?: string | null;
  object?: 'Contact';
  members?: { id: string }[];
}

export interface CreateAudienceListDto {
  name: string;
}
