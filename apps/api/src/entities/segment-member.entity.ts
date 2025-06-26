import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Segment } from './segment.entity';

@Entity('segment_members')
@Index(['contactId', 'segmentId'], { unique: true })
export class SegmentMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contact_id' })
  contactId: string;

  @Column({ name: 'segment_id' })
  segmentId: string;

  @Column({ name: 'is_dynamic', default: false })
  isDynamic: boolean;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  @ManyToOne(() => Segment, (segment) => segment.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'segment_id' })
  segment: Segment;
}
