import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';
import { Segment } from '../../entities/segment.entity';
import { SegmentMember } from '../../entities/segment-member.entity';
import { Contact } from '../../entities/contact.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Segment, SegmentMember, Contact]),
    ConfigModule,
  ],
  controllers: [SegmentsController],
  providers: [SegmentsService],
  exports: [SegmentsService],
})
export class SegmentsModule {}
