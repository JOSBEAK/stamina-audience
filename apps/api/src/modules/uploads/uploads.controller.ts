import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;
}

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-url')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Get a presigned URL for file upload' })
  async createPresignedUrl(
    @Body() createPresignedUrlDto: CreatePresignedUrlDto
  ) {
    return this.uploadsService.createPresignedUrl(createPresignedUrlDto);
  }
}
