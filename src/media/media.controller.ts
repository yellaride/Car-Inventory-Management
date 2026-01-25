import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { GenerateUploadUrlDto } from './dto/upload-url.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate presigned upload URL for client-side upload' })
  @ApiResponse({ status: 200, description: 'Upload URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    return this.mediaService.generateUploadUrl(dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload media file directly to server' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        carId: {
          type: 'string',
          format: 'uuid',
        },
        type: {
          type: 'string',
          enum: ['IMAGE', 'VIDEO', 'DOCUMENT'],
        },
        category: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or data' })
  async uploadFile(
    @UploadedFile() file: any,
    @Body('carId') carId: string,
    @Body('type') type: string,
    @Body('category') category?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const storageUrl = this.configService.get<string>('STORAGE_PUBLIC_URL') || 'http://localhost:3001/uploads';
    
    const createMediaDto: CreateMediaDto = {
      carId,
      type: type as any,
      category,
      url: `${storageUrl}/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    return this.mediaService.create(createMediaDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create media record manually' })
  @ApiResponse({ status: 201, description: 'Media created successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm upload completion and update file size' })
  @ApiResponse({ status: 200, description: 'Upload confirmed' })
  confirmUpload(
    @Param('id') id: string,
    @Body('fileSize') fileSize: number,
  ) {
    return this.mediaService.confirmUpload(id, fileSize);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of media returned' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('type') type?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const result = await this.mediaService.findAll({
      skip,
      take: limitNum,
      type,
    });

    return {
      data: result.data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNum),
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get media statistics' })
  @ApiResponse({ status: 200, description: 'Statistics returned' })
  getStats() {
    return this.mediaService.getStats();
  }

  @Get('car/:carId')
  @ApiOperation({ summary: 'Get all media for a specific car' })
  @ApiResponse({ status: 200, description: 'Media returned' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  findByCarId(@Param('carId') carId: string) {
    return this.mediaService.findByCarId(carId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ status: 200, description: 'Media found' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media by ID' })
  @ApiResponse({ status: 204, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
