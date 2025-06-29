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
  Delete,
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
  findAll(@Query() params: ListParamsDto) {
    return this.segmentsService.findAll(params);
  }

  @Get('deleted')
  findDeleted(@Query() params: ListParamsDto) {
    return this.segmentsService.findDeleted(params);
  }

  @Get('folders')
  findFolders() {
    return this.segmentsService.findFolders();
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
    return this.segmentsService.addContactsToSegment(id, addContactsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.segmentsService.softDelete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.segmentsService.restore(id);
  }

  @Delete(':id/contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeContactsFromSegment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { contactIds: string[] }
  ) {
    return this.segmentsService.removeContactsFromSegment(id, body.contactIds);
  }
}
