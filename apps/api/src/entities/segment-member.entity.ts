import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Segment } from './segment.entity';

@Entity('segment_members')
@Index(['contactId', 'segmentId'], { unique: true })
export class SegmentMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  locationId: string;

  @Index()
  @Column({ type: 'uuid', name: 'segment_id' })
  segmentId: string;

  @Index()
  @Column({ type: 'uuid', name: 'contact_id' })
  contactId: string;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Contact, (contact) => contact.segmentMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => Segment, (segment) => segment.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'segment_id' })
  segment: Segment;
}
