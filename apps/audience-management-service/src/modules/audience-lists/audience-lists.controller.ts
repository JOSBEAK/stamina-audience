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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AudienceListsService } from './audience-lists.service';
import {
  CreateAudienceListDto,
  AddContactsToAudienceListDto,
} from './dto/audience-list.dto';
import { AudienceListParamsDto } from './dto/audience-list-params.dto';
import { ContactListParamsDto } from '../contacts/dto/contact-list-params.dto';

@ApiTags('Audience Lists')
@Controller('audience-lists')
export class AudienceListsController {
  constructor(private readonly audienceListsService: AudienceListsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new audience list' })
  @ApiResponse({
    status: 201,
    description: 'Audience list created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createAudienceListDto: CreateAudienceListDto) {
    // TODO: Get user from request once auth is implemented
    return this.audienceListsService.create(createAudienceListDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active audience lists' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'folder', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved audience lists.',
  })
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    params: AudienceListParamsDto
  ) {
    return this.audienceListsService.findAll(params);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List all deleted audience lists' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'folder', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved deleted audience lists.',
  })
  findDeleted(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    params: AudienceListParamsDto
  ) {
    return this.audienceListsService.findDeleted(params);
  }

  @Get('folders')
  @ApiOperation({ summary: 'Get unique folder names from audience lists' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved unique folders.',
    type: [String],
  })
  findFolders() {
    return this.audienceListsService.findFolders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find an audience list by ID' })
  @ApiParam({ name: 'id', description: 'Audience list UUID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved audience list.',
  })
  @ApiResponse({ status: 404, description: 'Audience list not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.audienceListsService.findOne(id);
  }

  @Get(':id/contacts')
  @ApiOperation({ summary: 'Get contacts in an audience list' })
  @ApiParam({ name: 'id', description: 'Audience list UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved audience list contacts.',
  })
  @ApiResponse({ status: 404, description: 'Audience list not found.' })
  findAudienceListContacts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    listParams: ContactListParamsDto
  ) {
    return this.audienceListsService.findAudienceListContacts(id, listParams);
  }

  @Post(':id/contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add contacts to an audience list' })
  @ApiParam({ name: 'id', description: 'Audience list UUID' })
  @ApiBody({ type: AddContactsToAudienceListDto })
  @ApiResponse({
    status: 204,
    description: 'Contacts successfully added to audience list.',
  })
  @ApiResponse({ status: 404, description: 'Audience list not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
  @ApiOperation({ summary: 'Soft delete an audience list' })
  @ApiParam({ name: 'id', description: 'Audience list UUID' })
  @ApiResponse({
    status: 204,
    description: 'Audience list successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Audience list not found.' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.audienceListsService.softDelete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore a deleted audience list' })
  @ApiParam({ name: 'id', description: 'Audience list UUID' })
  @ApiResponse({
    status: 204,
    description: 'Audience list successfully restored.',
  })
  @ApiResponse({ status: 404, description: 'Audience list not found.' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.audienceListsService.restore(id);
  }

  @Delete(':id/contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove contacts from an audience list' })
  @ApiParam({ name: 'id', description: 'Audience list UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contactIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of contact UUIDs to remove',
        },
      },
      required: ['contactIds'],
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Contacts successfully removed from audience list.',
  })
  @ApiResponse({ status: 404, description: 'Audience list not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
