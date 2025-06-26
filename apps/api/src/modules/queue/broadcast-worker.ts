import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';

@Injectable()
export class BroadcastWorker {
  private readonly logger = new Logger(BroadcastWorker.name);
  @SqsMessageHandler('broadcast-sending', false)
  async handleMessage(message: Message) {
    const job = JSON.parse(message.Body);
    this.logger.log(`Sending broadcast: ${job.broadcastId}`);
    // In a real app, you would:
    // 1. Fetch broadcast details and recipient list from DB
    // 2. Iterate and send emails via SendGrid
    // 3. Update status in BroadcastRecipient table
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate work
    this.logger.log(`Finished sending broadcast: ${job.broadcastId}`);
  }
}
