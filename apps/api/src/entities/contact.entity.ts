import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { SegmentMember } from './segment-member.entity';
import { BroadcastRecipient } from './broadcast-recipient.entity';

// These types are not defined, so we will use a generic 'any' type for now.
// In a real application, these would be defined interfaces or classes.
type RelatedFrom = any;
type CRMLeadCustomAttribute = any;

@Entity('contacts') // Renamed from 'contacts'
// New indexes from your provided schema. Note: 'lead' is now 'email'.
@Index(['brandId', 'crmListId', 'email'], { unique: true })
@Index(['brandId', 'crmListId', 'owners'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Fields that MUST be non-nullable, per your instruction ---

  @Column({ type: 'varchar', length: 255 })
  name: string; // Renamed from 'firstName' from your schema

  @Index() // Keeping index on email for performance
  @Column({ type: 'varchar', length: 255 })
  email: string; // Renamed from 'lead'

  @Column({ type: 'varchar', length: 255 })
  role: string; // Renamed from 'title'

  @Column({ type: 'varchar' })
  location: string; // Made non-nullable

  @Column({ type: 'varchar' })
  avatar: string; // Renamed from 'avatarUrl'

  @Column({ type: 'varchar' })
  industry: string; // Added as it was missing but required to be non-nullable

  // --- All other fields are nullable, as requested ---

  @Column({ type: 'uuid', nullable: true })
  brandId: string;

  @Column('varchar', { array: true, default: [], nullable: true })
  crmListId: string[];

  @Column('varchar', { array: true, default: [], nullable: true })
  owners: string[];

  @Column({ type: 'int', default: 0, nullable: true })
  strength?: number;

  @Column({ type: 'boolean', default: false, nullable: true })
  isCompany?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  status: Record<string, string>;

  @Column({ type: 'bool', nullable: true })
  isTracked?: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastInteractionAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  company?: string;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  source?: string;

  @Column({ type: 'jsonb', default: [], nullable: true })
  relatedFrom?: RelatedFrom;

  @Column({ type: 'varchar', nullable: true })
  companyRole?: string;

  @Column({ type: 'varchar', nullable: true })
  timezone?: string;

  @Column({ type: 'int', nullable: true })
  rating?: number;

  @Column({ type: 'varchar', nullable: true })
  contractValue?: string;

  @Column({ type: 'varchar', nullable: true, default: '$' })
  contractCurrency?: string;

  @Column({ type: 'varchar', nullable: true })
  emailBounceScore?: string;

  @Column({ type: 'text', nullable: true })
  icebreaker?: string;

  @Column({ type: 'varchar', nullable: true })
  linkedInName?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkedInProviderId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  linkedInCompanyUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  facebookName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  youtubeName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  instagramName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telegramName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  whatsappName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  xName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  xCompanyName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
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
