import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRemarkDto } from './dto/create-remark.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';
import { Remark } from '@prisma/client';

@Injectable()
export class RemarksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new remark for a car
   */
  async create(createRemarkDto: CreateRemarkDto): Promise<Remark> {
    // Check if car exists
    const car = await this.prisma.car.findUnique({
      where: { id: createRemarkDto.carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${createRemarkDto.carId} not found`);
    }

    return this.prisma.remark.create({
      data: {
        carId: createRemarkDto.carId,
        text: createRemarkDto.text,
        type: createRemarkDto.type,
        priority: createRemarkDto.priority,
        createdBy: createRemarkDto.createdBy || 'system',
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
   * Get all remarks for a specific car
   */
  async findByCarId(carId: string): Promise<Remark[]> {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    return this.prisma.remark.findMany({
      where: { carId },
      orderBy: { createdAt: 'desc' },
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
   * Get a single remark by ID
   */
  async findOne(id: string): Promise<Remark> {
    const remark = await this.prisma.remark.findUnique({
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

    if (!remark) {
      throw new NotFoundException(`Remark with ID ${id} not found`);
    }

    return remark;
  }

  /**
   * Get all remarks (with optional filtering)
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    type?: string;
    priority?: string;
  }): Promise<{ data: Remark[]; total: number }> {
    const { skip = 0, take = 50, type, priority } = params || {};

    const where: any = {};
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const [data, total] = await Promise.all([
      this.prisma.remark.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
      this.prisma.remark.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Update a remark
   */
  async update(id: string, updateRemarkDto: UpdateRemarkDto): Promise<Remark> {
    await this.findOne(id); // Check if exists

    return this.prisma.remark.update({
      where: { id },
      data: {
        text: updateRemarkDto.text,
        type: updateRemarkDto.type,
        priority: updateRemarkDto.priority,
        updatedBy: updateRemarkDto.updatedBy,
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
   * Delete a remark
   */
  async remove(id: string): Promise<Remark> {
    await this.findOne(id); // Check if exists

    return this.prisma.remark.delete({
      where: { id },
    });
  }

  /**
   * Get remarks count by type
   */
  async getRemarkStats() {
    const [byType, byPriority, total] = await Promise.all([
      this.prisma.remark.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.remark.groupBy({
        by: ['priority'],
        _count: true,
      }),
      this.prisma.remark.count(),
    ]);

    return {
      total,
      byType,
      byPriority,
    };
  }
}
