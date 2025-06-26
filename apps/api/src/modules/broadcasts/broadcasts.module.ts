import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BroadcastsController } from './broadcasts.controller';
import { BroadcastsService } from './broadcasts.service';
import { Broadcast } from '../../entities/broadcast.entity';
import { BroadcastRecipient } from '../../entities/broadcast-recipient.entity';
import { Contact } from '../../entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Broadcast, BroadcastRecipient, Contact])],
  controllers: [BroadcastsController],
  providers: [BroadcastsService],
})
export class BroadcastsModule {}
