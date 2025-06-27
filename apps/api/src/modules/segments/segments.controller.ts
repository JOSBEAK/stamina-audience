import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto, AddContactsToSegmentDto } from './dto/segment.dto';
import { ListParamsDto } from '../common/dto/list-params.dto';

@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Post()
  create(@Body() createSegmentDto: CreateSegmentDto) {
    // TODO: Get user from request once auth is implemented
    return this.segmentsService.create(createSegmentDto);
  }

  @Get()
  findAll() {
    return this.segmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.segmentsService.findOne(id);
  }

  @Get(':id/contacts')
  findSegmentContacts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() listParams: ListParamsDto
  ) {
    return this.segmentsService.findSegmentContacts(id, listParams);
  }

  @Post(':id/contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  addContactsToSegment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addContactsDto: AddContactsToSegmentDto
  ) {
    return this.segmentsService.addContacts(id, addContactsDto.contactIds);
  }
}
