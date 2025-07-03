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
import { AudienceListMember } from './audience-list-member.entity';

export enum AudienceListType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

@Entity('audience_lists')
export class AudienceList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  locationId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AudienceListType,
  })
  type: AudienceListType;

  @Column({ name: 'rules_json', type: 'jsonb', nullable: true })
  rulesJson: Record<string, unknown>;

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

  @OneToMany(() => AudienceListMember, (member) => member.audienceList)
  members: AudienceListMember[];

  @Column({ name: 'used_in_count', type: 'int', default: 0 })
  usedInCount: number;

  @Column({ nullable: true })
  folder: string;

  // This is a computed property, not a column
  memberCount?: number;
}
