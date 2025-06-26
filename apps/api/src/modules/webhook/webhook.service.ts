import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendGridEvent } from '@stamina-project/types';

import {
  BroadcastRecipient,
  RecipientStatus,
} from '../../entities/broadcast-recipient.entity';
import { BroadcastAnalyticsTimeseries } from '../../entities/broadcast-analytics-timeseries.entity';

// Define a type for the custom arguments we expect from the webhook
interface SendGridCustomArgs {
  broadcast_recipient_id: string;
  // We can add broadcast_id here too for easier lookup
}

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(BroadcastRecipient)
    private readonly recipientRepository: Repository<BroadcastRecipient>,
    @InjectRepository(BroadcastAnalyticsTimeseries)
    private readonly analyticsRepository: Repository<BroadcastAnalyticsTimeseries>
  ) {}

  async processEvents(events: SendGridEvent[]) {
    // This can be optimized to group updates by broadcast for fewer DB queries
    for (const event of events) {
      const customArgs = (event as any).custom_args as SendGridCustomArgs;
      if (!customArgs?.broadcast_recipient_id) {
        console.warn('Skipping event with no broadcast_recipient_id', event);
        continue;
      }

      const recipient = await this.recipientRepository.findOne({
        where: { id: customArgs.broadcast_recipient_id },
        relations: ['broadcast'], // Load the broadcast relation
      });

      if (!recipient) {
        console.warn(
          'Recipient not found for ID:',
          customArgs.broadcast_recipient_id
        );
        continue;
      }

      // --- Update Recipient Status ---
      let statusToUpdate: RecipientStatus | null = null;
      switch (event.event) {
        case 'open':
          statusToUpdate = RecipientStatus.OPENED;
          if (!recipient.firstOpenedAt) recipient.firstOpenedAt = new Date();
          break;
        case 'click':
          statusToUpdate = RecipientStatus.CLICKED;
          if (!recipient.firstClickedAt) recipient.firstClickedAt = new Date();
          break;
        case 'bounce':
          statusToUpdate = RecipientStatus.BOUNCED;
          break;
        // 'sent' status is usually set by the sending worker, but could be updated here
      }

      if (statusToUpdate) {
        recipient.status = statusToUpdate;
        await this.recipientRepository.save(recipient);
      }

      // --- Increment Timeseries Analytics ---
      const now = new Date();
      const timestampBucket = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours()
      );

      const analyticsUpdate: Partial<BroadcastAnalyticsTimeseries> = {
        sentIncrement:
          event.event === 'processed' || event.event === 'delivered' ? 1 : 0,
        openIncrement: event.event === 'open' ? 1 : 0,
        clickIncrement: event.event === 'click' ? 1 : 0,
      };

      await this.analyticsRepository.upsert(
        {
          broadcastId: recipient.broadcastId,
          timestampBucket,
          sentIncrement: () =>
            `sent_increment + ${analyticsUpdate.sentIncrement}`,
          openIncrement: () =>
            `open_increment + ${analyticsUpdate.openIncrement}`,
          clickIncrement: () =>
            `click_increment + ${analyticsUpdate.clickIncrement}`,
        },
        ['broadcastId', 'timestampBucket']
      );
    }
  }
}
