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
  HttpCode,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { Contact } from '../../entities/contact.entity';
import { ContactListParamsDto } from './dto/contact-list-params.dto';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

class ProcessCsvDto {
  @ApiProperty({ description: 'The key of the uploaded CSV file in R2.' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty({
    description: 'A map of CSV headers to contact fields.',
    example: { 'Full Name': 'name', 'Email Address': 'email' },
  })
  @IsObject()
  mapping: Record<string, string>;

  @ApiProperty({
    description: 'The ID of the audience list to add contacts to.',
    required: false,
  })
  @IsOptional()
  @IsString()
  audienceListId?: string;
}

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
  @ApiBody({ type: [CreateContactDto] })
  @ApiResponse({
    status: 201,
    description: 'The contacts have been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  createBatch(
    @Body(new ParseArrayPipe({ items: CreateContactDto }))
    createContactDtos: CreateContactDto[]
  ) {
    return this.contactsService.createBatch(createContactDtos);
  }


  @Post('process-csv')
  @HttpCode(202)
  @ApiOperation({ summary: 'Queue a CSV file for processing' })
  async processCsv(@Body() processCsvDto: ProcessCsvDto) {
    this.logger.log(
      `[DEBUG] processCsv received fileKey: ${processCsvDto.fileKey}`
    );
    await this.contactsService.queueCsvProcessingJob(processCsvDto);
    return {
      message: 'CSV file is being processed.',
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all contacts' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'company', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'industry', required: false })
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    params: ContactListParamsDto
  ) {
    return this.contactsService.findAll(params);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get unique contact locations' })
  @ApiResponse({
    status: 200,
    description: 'A list of unique locations.',
    type: [String],
  })
  findUniqueLocations() {
    return this.contactsService.findUniqueLocations();
  }

  @Get('companies')
  @ApiOperation({ summary: 'Get unique contact companies' })
  @ApiResponse({
    status: 200,
    description: 'A list of unique companies.',
    type: [String],
  })
  findUniqueCompanies() {
    return this.contactsService.findUniqueCompanies();
  }

  @Get('search-attributes')
  @ApiOperation({ summary: 'Search for unique attribute values' })
  @ApiQuery({
    name: 'attribute',
    required: true,
    enum: ['company', 'location', 'industry', 'role'],
  })
  @ApiQuery({ name: 'search', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'A list of matching attribute values.',
    type: [String],
  })
  searchAttributes(
    @Query('attribute') attribute: 'company' | 'location' | 'industry' | 'role',
    @Query('search') search: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number
  ) {
    return this.contactsService.searchAttributes(
      attribute,
      search,
      limit,
      page
    );
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
