import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BroadcastRecipient } from './broadcast-recipient.entity';
import { BroadcastAnalyticsTimeseries } from './broadcast-analytics-timeseries.entity';

export enum BroadcastStatus {
  DRAFT = 'draft',
  SENDING = 'sending',
  SENT = 'sent',
  ARCHIVED = 'archived',
}

@Entity('broadcasts')
export class Broadcast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ type: 'jsonb', name: 'email_metadata' })
  emailMetadata: {
    subject: string;
    preview_text: string;
    sender_name: string;
    sender_address: string;
  };

  @Column({
    type: 'enum',
    enum: BroadcastStatus,
    default: BroadcastStatus.DRAFT,
  })
  status: BroadcastStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @OneToMany(() => BroadcastRecipient, (recipient) => recipient.broadcast)
  recipients: BroadcastRecipient[];

  @OneToMany(() => BroadcastAnalyticsTimeseries, (ts) => ts.broadcast)
  analyticsTimeseries: BroadcastAnalyticsTimeseries[];
}
