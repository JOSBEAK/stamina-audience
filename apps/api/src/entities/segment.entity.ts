import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { SegmentMember } from './segment-member.entity';

export enum SegmentType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

@Entity('segments')
export class Segment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  locationId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SegmentType,
  })
  type: SegmentType;

  @Column({ name: 'rules_json', type: 'jsonb', nullable: true })
  rulesJson: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({
    type: 'tsvector',
    name: 'search_vector',
    select: false,
    insert: false,
    update: false,
    nullable: true,
  })
  searchVector: string;

  @OneToMany(() => SegmentMember, (member) => member.segment)
  members: SegmentMember[];

  @Column({ name: 'used_in_count', type: 'int', default: 0 })
  usedInCount: number;

  @Column({ nullable: true })
  folder: string;

  // This is a computed property, not a column
  memberCount?: number;
}
