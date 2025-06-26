import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { SendGridEvent } from '@stamina-project/types';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('email-events')
  @HttpCode(200)
  handleEmailEvents(@Body() events: SendGridEvent[]) {
    // SendGrid sends events in batches
    console.log('Received email events:', events);
    return this.webhookService.processEvents(events);
  }
}
