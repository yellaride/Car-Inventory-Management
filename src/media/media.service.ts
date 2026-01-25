import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { GenerateUploadUrlDto } from './dto/upload-url.dto';
import { Media, Prisma } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  /**
   * Generate upload URL for client-side upload
   */
  async generateUploadUrl(dto: GenerateUploadUrlDto) {
    // Check if car exists
    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${dto.carId} not found`);
    }

    // Get MIME type from file extension
    const ext = dto.fileName.split('.').pop()?.toLowerCase();
    const mimeType = this.getMimeType(ext || '', dto.type);

    // Generate upload URL
    const { uploadUrl, fileUrl } = await this.storage.generateUploadUrl(dto.fileName, mimeType);

    // Create pending media record
    const media = await this.prisma.media.create({
      data: {
        carId: dto.carId,
        type: dto.type,
        category: dto.category,
        url: fileUrl,
        fileName: dto.fileName,
        fileSize: 0, // Will be updated after upload
        mimeType,
        status: 'UPLOADING',
      },
    });

    return {
      mediaId: media.id,
      uploadUrl,
      fileUrl,
    };
  }

  /**
   * Create media record after upload
   */
  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    // Check if car exists
    const car = await this.prisma.car.findUnique({
      where: { id: createMediaDto.carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${createMediaDto.carId} not found`);
    }

    return this.prisma.media.create({
      data: {
        carId: createMediaDto.carId,
        type: createMediaDto.type,
        category: createMediaDto.category,
        url: createMediaDto.url,
        thumbnailUrl: createMediaDto.thumbnailUrl,
        fileName: createMediaDto.fileName,
        fileSize: createMediaDto.fileSize,
        mimeType: createMediaDto.mimeType,
        duration: createMediaDto.duration,
        resolution: createMediaDto.resolution,
        uploadedBy: createMediaDto.uploadedBy || 'system',
        status: 'READY',
      },
      include: {
        car: {
          select: {
            id: true,
            vin: true,
            make: true,
            model: true,
            year: true,
          },
        },
      },
    });
  }

  /**
   * Confirm upload and update media record
   */
  async confirmUpload(mediaId: string, fileSize: number) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    return this.prisma.media.update({
      where: { id: mediaId },
      data: {
        fileSize,
        status: 'READY',
      },
    });
  }

  /**
   * Get all media for a specific car
   */
  async findByCarId(carId: string): Promise<Media[]> {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    return this.prisma.media.findMany({
      where: { carId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /**
   * Get media by ID
   */
  async findOne(id: string): Promise<Media> {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        car: {
          select: {
            id: true,
            vin: true,
            make: true,
            model: true,
            year: true,
          },
        },
      },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return media;
  }

  /**
   * Get all media with filters
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    type?: string;
  }): Promise<{ data: Media[]; total: number }> {
    const { skip = 0, take = 50, type } = params || {};

    const where: any = {};
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take,
        orderBy: { uploadedAt: 'desc' },
        include: {
          car: {
            select: {
              id: true,
              vin: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Delete media
   */
  async remove(id: string): Promise<Media> {
    const media = await this.findOne(id);

    // Delete file from storage
    const fileName = media.url.split('/').pop();
    if (fileName) {
      await this.storage.deleteFile(fileName);
    }

    return this.prisma.media.delete({
      where: { id },
    });
  }

  /**
   * Get media statistics
   */
  async getStats() {
    const [total, byType, totalSize] = await Promise.all([
      this.prisma.media.count(),
      this.prisma.media.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.media.aggregate({
        _sum: {
          fileSize: true,
        },
      }),
    ]);

    return {
      total,
      byType,
      totalSize: totalSize._sum.fileSize || 0,
    };
  }

  /**
   * Helper: Get MIME type from extension
   */
  private getMimeType(ext: string, type: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
