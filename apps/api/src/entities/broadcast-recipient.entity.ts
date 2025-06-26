import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Broadcast } from './broadcast.entity';
import { Contact } from './contact.entity';

export enum RecipientStatus {
  PENDING = 'pending',
  SENT = 'sent',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
}

@Entity('broadcast_recipients')
@Index(['broadcastId', 'recipientId'], { unique: true })
export class BroadcastRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'broadcast_id' })
  broadcastId: string;

  @Index()
  @Column({ name: 'recipient_id' })
  recipientId: string;

  @Index()
  @Column({
    type: 'enum',
    enum: RecipientStatus,
    default: RecipientStatus.PENDING,
  })
  status: RecipientStatus;

  @Column({ name: 'first_opened_at', type: 'timestamp', nullable: true })
  firstOpenedAt: Date;

  @Column({ name: 'first_clicked_at', type: 'timestamp', nullable: true })
  firstClickedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Broadcast, (broadcast) => broadcast.recipients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'broadcast_id' })
  broadcast: Broadcast;

  @ManyToOne(() => Contact, (contact) => contact.broadcastRecipients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipient_id' })
  contact: Contact;
}
