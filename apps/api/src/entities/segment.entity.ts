import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
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

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SegmentType,
  })
  type: SegmentType;

  @Column({ name: 'rules_json', type: 'jsonb', nullable: true })
  rulesJson: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => SegmentMember, (member) => member.segment)
  members: SegmentMember[];
}
