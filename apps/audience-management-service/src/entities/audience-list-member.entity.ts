import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Contact } from './contact.entity';
import { AudienceList } from './audience-list.entity';
import { BaseEntity } from './base.entity';

@Entity('audience_list_members')
@Index(['contactId', 'audienceListId'], { unique: true })
export class AudienceListMember extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', name: 'audience_list_id' })
  audienceListId: string;

  @Index()
  @Column({ type: 'uuid', name: 'contact_id' })
  contactId: string;

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
