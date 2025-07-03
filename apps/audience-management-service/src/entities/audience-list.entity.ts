import { Entity, Column, OneToMany, DeleteDateColumn, Index } from 'typeorm';
import { AudienceListMember } from './audience-list-member.entity';
import { BaseEntity } from './base.entity';

export enum AudienceListType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

@Entity('audience_lists')
export class AudienceList extends BaseEntity {
  @Index() // Adding index for sorting and search performance
  @Column()
  name: string;

  @Index() // Adding index for filtering and sorting by list type
  @Column({
    type: 'enum',
    enum: AudienceListType,
  })
  type: AudienceListType;

  @Column({ name: 'rules_json', type: 'jsonb', nullable: true })
  rulesJson: Record<string, unknown>;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

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

  @Index() // Adding index for sorting performance
  @Column({ name: 'used_in_count', type: 'int', default: 0 })
  usedInCount: number;

  @Index() // Adding index for folder filtering (exact match and IS NULL queries)
  @Column({ nullable: true })
  folder: string;

  // This is a computed property, not a column
  memberCount?: number;
}
