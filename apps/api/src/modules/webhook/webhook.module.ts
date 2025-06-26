import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { BroadcastRecipient } from '../../entities/broadcast-recipient.entity';
import { BroadcastAnalyticsTimeseries } from '../../entities/broadcast-analytics-timeseries.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BroadcastRecipient,
      BroadcastAnalyticsTimeseries,
    ]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
