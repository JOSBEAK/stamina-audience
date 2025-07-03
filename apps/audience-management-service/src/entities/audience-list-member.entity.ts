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
import { AudienceList } from './audience-list.entity';

@Entity('audience_list_members')
@Index(['contactId', 'audienceListId'], { unique: true })
export class AudienceListMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  locationId: string;

  @Index()
  @Column({ type: 'uuid', name: 'audience_list_id' })
  audienceListId: string;

  @Index()
  @Column({ type: 'uuid', name: 'contact_id' })
  contactId: string;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Contact, (contact) => contact.audienceListMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => AudienceList, (audienceList) => audienceList.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'audience_list_id' })
  audienceList: AudienceList;
}
