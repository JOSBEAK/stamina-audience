import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudienceListsController } from './audience-lists.controller';
import { AudienceListsService } from './audience-lists.service';
import { AudienceList } from '../../entities/audience-list.entity';
import { AudienceListMember } from '../../entities/audience-list-member.entity';
import { Contact } from '../../entities/contact.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AudienceList, AudienceListMember, Contact]),
    ConfigModule,
  ],
  controllers: [AudienceListsController],
  providers: [AudienceListsService],
  exports: [AudienceListsService],
})
export class AudienceListsModule {}
