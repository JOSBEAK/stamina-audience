import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
// import { SqsService } from '@ssut/nestjs-sqs';
// import { v4 as uuidv4 } from 'uuid';

import { Broadcast, BroadcastStatus } from '../../entities/broadcast.entity';
import {
  BroadcastRecipient,
  RecipientStatus,
} from '../../entities/broadcast-recipient.entity';
import { Contact } from '../../entities/contact.entity';
import { CreateBroadcastDto } from '@stamina-project/types';

@Injectable()
export class BroadcastsService {
  constructor(
    @InjectRepository(Broadcast)
    private readonly broadcastRepository: Repository<Broadcast>,
    @InjectRepository(BroadcastRecipient)
    private readonly recipientRepository: Repository<BroadcastRecipient>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly dataSource: DataSource // private readonly sqsService: SqsService,
  ) {}

  async create(dto: CreateBroadcastDto): Promise<Broadcast> {
    // For this example, we assume we are sending to all contacts.
    // A real implementation would use the `audience_id` to get a specific list.
    const allContacts = await this.contactRepository.find();

    const broadcast = this.broadcastRepository.create({
      templateId: dto.template_id,
      emailMetadata: dto.email_metadata,
      status: BroadcastStatus.SENDING,
    });

    // Use a transaction to create the broadcast and all recipient records atomically.
    await this.dataSource.transaction(async (manager) => {
      await manager.save(broadcast);

      const recipients = allContacts.map((contact) =>
        manager.create(BroadcastRecipient, {
          broadcastId: broadcast.id,
          recipientId: contact.id,
          status: RecipientStatus.PENDING,
        })
      );
      await manager.save(recipients);
      broadcast.recipients = recipients; // assign for the return object
    });

    console.log('SQS is disabled. Fan-out to queue is skipped.');
    // Explicit Fan-Out: After the transaction, queue a job for each recipient.
    /*
    for (const recipient of broadcast.recipients) {
      await this.sqsService.send('broadcast-sending', {
        id: uuidv4(),
        body: JSON.stringify({
          broadcast_recipient_id: recipient.id,
          template_id: broadcast.templateId,
          email_address: allContacts.find(c => c.id === recipient.recipientId)?.email,
          metadata: broadcast.emailMetadata,
        }),
      });
    }
    */

    return broadcast;
  }

  findAll() {
    // In a real app, this would be paginated and include summary stats.
    return this.broadcastRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    // Example of fetching the broadcast and its aggregated analytics.
    const broadcast = await this.broadcastRepository.findOneByOrFail({ id });
    const analytics = await this.dataSource
      .getRepository(BroadcastRecipient)
      .createQueryBuilder('rec')
      .select('rec.status', 'status')
      .addSelect('COUNT(rec.id)', 'count')
      .where('rec.broadcastId = :id', { id })
      .groupBy('rec.status')
      .getRawMany();

    // In a real app, you would also fetch the timeseries data.
    return { ...broadcast, analytics_summary: analytics };
  }
}
