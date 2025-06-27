import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { Contact } from '../../entities/contact.entity';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  private readonly logger = new Logger(ContactsController.name);
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({
    status: 201,
    description: 'The contact has been successfully created.',
    type: Contact,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createContactDto: CreateContactDto) {
    this.logger.log(
      `Creating new contact for email: ${createContactDto.email}`
    );
    return this.contactsService.create(createContactDto);
  }

  @Post('batch')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create multiple contacts in a batch' })
  @ApiResponse({
    status: 201,
    description: 'The contacts have been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  createBatch(@Body() createContactDtos: CreateContactDto[]) {
    return this.contactsService.createBatch(createContactDtos);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload contacts via CSV' })
  @ApiResponse({
    status: 202,
    description: 'The CSV upload process has been initiated.',
  })
  uploadCsv() {
    // This will be handled by the service, placeholder for now
    return this.contactsService.uploadCsv();
  }

  @Get()
  @ApiOperation({ summary: 'Find all contacts' })
  @ApiQuery({ name: 'role', required: true, type: String })
  @ApiQuery({ name: 'company', required: true, type: String })
  @ApiQuery({ name: 'location', required: true, type: String })
  @ApiQuery({ name: 'industry', required: true, type: String })
  @ApiQuery({ name: 'search', required: true, type: String })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: 'A list of contacts.',
    type: [Contact],
  })
  findAll(
    @Query('role') role?: string,
    @Query('company') company?: string,
    @Query('location') location?: string,
    @Query('industry') industry?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const take = limit ? parseInt(limit, 10) : 10;
    const pageNumber = page ? parseInt(page, 10) : 1;
    const skip = (pageNumber - 1) * take;
    return this.contactsService.findAll({
      role,
      company,
      location,
      industry,
      search,
      take,
      skip,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a contact by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found contact.',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @ApiResponse({
    status: 200,
    description: 'The updated contact.',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete('batch')
  @ApiOperation({ summary: 'Delete multiple contacts in a batch' })
  @ApiResponse({
    status: 200,
    description: 'The contacts have been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  removeBatch(@Body('ids') ids: string[]) {
    return this.contactsService.removeBatch(ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiResponse({ status: 200, description: 'Contact successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
