import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { AudienceListsService } from './audience-lists.service';
import {
  CreateAudienceListDto,
  AddContactsToAudienceListDto,
} from './dto/audience-list.dto';
import { AudienceListParamsDto } from './dto/audience-list-params.dto';
import { ContactListParamsDto } from '../contacts/dto/contact-list-params.dto';

@Controller('audience-lists')
export class AudienceListsController {
  constructor(private readonly audienceListsService: AudienceListsService) {}

  @Post()
  create(@Body() createAudienceListDto: CreateAudienceListDto) {
    // TODO: Get user from request once auth is implemented
    return this.audienceListsService.create(createAudienceListDto);
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    params: AudienceListParamsDto
  ) {
    return this.audienceListsService.findAll(params);
  }

  @Get('deleted')
  findDeleted(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    params: AudienceListParamsDto
  ) {
    return this.audienceListsService.findDeleted(params);
  }

  @Get('folders')
  findFolders() {
    return this.audienceListsService.findFolders();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.audienceListsService.findOne(id);
  }

  @Get(':id/contacts')
  findAudienceListContacts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    listParams: ContactListParamsDto
  ) {
    return this.audienceListsService.findAudienceListContacts(id, listParams);
  }

  @Post(':id/contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  addContactsToAudienceList(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addContactsDto: AddContactsToAudienceListDto
  ) {
    return this.audienceListsService.addContactsToAudienceList(
      id,
      addContactsDto
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.audienceListsService.softDelete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.audienceListsService.restore(id);
  }

  @Delete(':id/contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeContactsFromAudienceList(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { contactIds: string[] }
  ) {
    return this.audienceListsService.removeContactsFromAudienceList(
      id,
      body.contactIds
    );
  }
}
