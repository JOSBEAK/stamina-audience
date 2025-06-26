import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import {
  CreateBroadcastSchema,
  CreateBroadcastDto,
} from '@stamina-project/types';

@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  @Post()
  @HttpCode(202) // 202 Accepted
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createBroadcastDto: CreateBroadcastDto) {
    // Manually validate with Zod schema for safety, though ValidationPipe helps
    const validatedData = CreateBroadcastSchema.parse(createBroadcastDto);
    return this.broadcastsService.create(validatedData);
  }

  @Get()
  findAll() {
    return this.broadcastsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.broadcastsService.findOne(id);
  }
}
