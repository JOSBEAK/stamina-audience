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
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createContactDto: CreateContactDto) {
    console.log('createContactDto', createContactDto);
    return this.contactsService.create(createContactDto);
  }

  @Post('batch')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  createBatch(@Body() createContactDtos: CreateContactDto[]) {
    return this.contactsService.createBatch(createContactDtos);
  }

  @Post('upload')
  uploadCsv() {
    // This will be handled by the service, placeholder for now
    return this.contactsService.uploadCsv();
  }

  @Get()
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
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
