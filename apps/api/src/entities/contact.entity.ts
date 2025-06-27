import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BroadcastRecipient } from './broadcast-recipient.entity';
import {
  RelatedFrom,
  CRMLeadCustomAttribute,
} from '../modules/contacts/dto/contact.dto';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Fields that MUST be non-nullable, per your instruction ---

  @Column({ type: 'varchar', length: 255 })
  name: string; // Renamed from 'firstName' from your schema

  @Index() // Keeping index on email for performance
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string; // Renamed from 'lead'

  @Index()
  @Column({ type: 'varchar', length: 255 })
  role: string; // Renamed from 'title'

  @Column({ type: 'varchar' })
  location: string; // Made non-nullable

  @Column({ type: 'varchar' })
  avatar: string; // Renamed from 'avatarUrl'

  @Index()
  @Column({ type: 'varchar' })
  industry: string; // Added as it was missing but required to be non-nullable

  // --- All other fields are nullable, as requested ---

  @Column({ type: 'uuid', nullable: true, name: 'brand_id' })
  brandId: string;

  @Column('varchar', {
    array: true,
    default: [],
    nullable: true,
    name: 'crm_list_id',
  })
  crmListId: string[];

  @Column('varchar', { array: true, default: [], nullable: true })
  owners: string[];

  @Column({ type: 'int', default: 0, nullable: true })
  strength?: number;

  @Column({
    type: 'boolean',
    default: false,
    nullable: true,
    name: 'is_company',
  })
  isCompany?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'last_name' })
  lastName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  status: Record<string, string>;

  @Column({ type: 'bool', nullable: true, name: 'is_tracked' })
  isTracked?: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_interaction_at',
  })
  lastInteractionAt?: Date;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  company?: string;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  source?: string;

  @Column({ type: 'jsonb', default: [], nullable: true, name: 'related_from' })
  relatedFrom?: RelatedFrom;

  @Column({ type: 'varchar', nullable: true, name: 'company_role' })
  companyRole?: string;

  @Column({ type: 'varchar', nullable: true })
  timezone?: string;

  @Column({ type: 'int', nullable: true })
  rating?: number;

  @Column({ type: 'varchar', nullable: true, name: 'contract_value' })
  contractValue?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: '$',
    name: 'contract_currency',
  })
  contractCurrency?: string;

  @Column({ type: 'varchar', nullable: true, name: 'email_bounce_score' })
  emailBounceScore?: string;

  @Column({ type: 'text', nullable: true })
  icebreaker?: string;

  @Column({ type: 'varchar', nullable: true, name: 'linkedin_name' })
  linkedInName?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'linkedin_provider_id',
  })
  linkedInProviderId?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'linkedin_company_url',
  })
  linkedInCompanyUrl: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'facebook_name',
  })
  facebookName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'youtube_name' })
  youtubeName?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'instagram_name',
  })
  instagramName?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'telegram_name',
  })
  telegramName?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'whatsapp_name',
  })
  whatsappName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'x_name' })
  xName?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'x_company_name',
  })
  xCompanyName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'website_url' })
  websiteUrl?: string;

  @Column('uuid', { array: true, default: [], nullable: true })
  tags?: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
    default: [],
  })
  attributes?: CRMLeadCustomAttribute[];

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
    name: 'linkedin_meta',
  })
  linkedInMeta: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: 'tsvector',
    name: 'search_vector',
    select: false,
    insert: false,
    update: false,
    nullable: true,
  })
  searchVector: string;

  @OneToMany(() => BroadcastRecipient, (recipient) => recipient.contact)
  broadcastRecipients: BroadcastRecipient[];
}
