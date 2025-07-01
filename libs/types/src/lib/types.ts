import * as z from 'zod';

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

// Properly typed schemas
export const RelatedFromSchema = z.object({
  type: z.literal('LEAD'),
  value: z.union([z.string(), z.number(), z.record(z.unknown())]),
});

const CRMLeadCustomAttributeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

export const ContactSchema = z.object({
  id: z.string().uuid(),

  // Non-nullable fields
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  location: z.string(),
  avatar: z.string(),
  industry: z.nativeEnum(Industry).optional().nullable(),

  // Nullable/optional fields
  brandId: z.string().uuid().nullable().optional(),
  crmListId: z.array(z.string()).nullable().optional(),
  owners: z.array(z.string()).nullable().optional(),
  strength: z.number().nullable().optional(),
  isCompany: z.boolean().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.record(z.string()).nullable().optional(),
  isTracked: z.boolean().nullable().optional(),
  lastInteractionAt: z.date().nullable().optional(),
  company: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  relatedFrom: RelatedFromSchema.nullable().optional(),
  companyRole: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  contractValue: z.string().nullable().optional(),
  contractCurrency: z.string().nullable().optional(),
  emailBounceScore: z.string().nullable().optional(),
  icebreaker: z.string().nullable().optional(),
  linkedInName: z.string().nullable().optional(),
  linkedInProviderId: z.string().nullable().optional(),
  linkedInCompanyUrl: z.string().nullable().optional(),
  facebookName: z.string().nullable().optional(),
  youtubeName: z.string().nullable().optional(),
  instagramName: z.string().nullable().optional(),
  telegramName: z.string().nullable().optional(),
  whatsappName: z.string().nullable().optional(),
  xName: z.string().nullable().optional(),
  xCompanyName: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  tags: z.array(z.string().uuid()).nullable().optional(),
  attributes: z.array(CRMLeadCustomAttributeSchema).nullable().optional(),
  linkedInMeta: z.record(z.unknown()).nullable().optional(),
  search: z.string().nullable().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Contact = z.infer<typeof ContactSchema>;

export const BroadcastSchema = z.object({
  id: z.string().cuid(),
  subject: z.string().min(1),
  content: z.string().min(1),
  sentAt: z.date().optional(),
});

export type Broadcast = z.infer<typeof BroadcastSchema>;

export const CreateBroadcastSchema = z.object({
  template_id: z.string(),
  email_metadata: z.object({
    subject: z.string(),
    preview_text: z.string(),
    sender_name: z.string(),
    sender_address: z.string().email(),
  }),
});

export type CreateBroadcastDto = z.infer<typeof CreateBroadcastSchema>;

export const SendGridEventSchema = z
  .object({
    email: z.string(),
    timestamp: z.number(),
    event: z.string(),
  })
  .passthrough(); // Allow other properties from SendGrid

export type SendGridEvent = z.infer<typeof SendGridEventSchema>;

export interface CreateAudienceListDto {
  name: string;
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
