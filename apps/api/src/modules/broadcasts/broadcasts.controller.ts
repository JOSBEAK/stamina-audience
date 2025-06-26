import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BroadcastsService } from './broadcasts.service';
import {
  CreateBroadcastSchema,
  CreateBroadcastDto,
} from '@stamina-project/types';
import { Broadcast } from '../../entities/broadcast.entity';

@ApiTags('Broadcasts')
@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  @Post()
  @HttpCode(202) // 202 Accepted
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create and queue a new broadcast' })
  @ApiResponse({
    status: 202,
    description: 'Broadcast creation has been accepted for processing.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createBroadcastDto: CreateBroadcastDto) {
    // Manually validate with Zod schema for safety, though ValidationPipe helps
    const validatedData = CreateBroadcastSchema.parse(createBroadcastDto);
    return this.broadcastsService.create(validatedData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all broadcasts' })
  @ApiResponse({
    status: 200,
    description: 'A list of all broadcasts.',
    type: [Broadcast],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 10;
    const pageNumber = page ? parseInt(page, 10) : 1;
    const skip = (pageNumber - 1) * take;
    return this.broadcastsService.findAll({ take, skip });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single broadcast by ID' })
  @ApiResponse({
    status: 200,
    description: 'The requested broadcast.',
    type: Broadcast,
  })
  @ApiResponse({ status: 404, description: 'Broadcast not found.' })
  findOne(@Param('id') id: string) {
    return this.broadcastsService.findOne(id);
  }
}
