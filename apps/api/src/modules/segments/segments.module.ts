import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';
import { Segment } from '../../entities/segment.entity';
import { SegmentMember } from '../../entities/segment-member.entity';
import { Contact } from '../../entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Segment, SegmentMember, Contact])],
  controllers: [SegmentsController],
  providers: [SegmentsService],
})
export class SegmentsModule {}
