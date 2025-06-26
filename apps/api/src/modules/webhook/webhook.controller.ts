import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { SendGridEvent } from '@stamina-project/types';
import { SendGridEventDto } from './dto/webhook.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  constructor(private readonly webhookService: WebhookService) {}

  @Post('email-events')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle email events from SendGrid' })
  @ApiBody({ type: [SendGridEventDto] })
  @ApiResponse({ status: 200, description: 'The events have been processed.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  handleEmailEvents(@Body() events: SendGridEvent[]) {
    // SendGrid sends events in batches
    this.logger.log(`Received ${events.length} email events from webhook.`);
    return this.webhookService.processEvents(events);
  }
}
