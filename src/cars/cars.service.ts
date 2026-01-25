import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VinDecoderService } from './vin-decoder.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, Prisma } from '@prisma/client';

@Injectable()
export class CarsService {
  constructor(
    private prisma: PrismaService,
    private vinDecoder: VinDecoderService,
  ) {}

  /**
   * Create a new car record
   */
  async create(createCarDto: CreateCarDto): Promise<Car> {
    // Validate VIN format
    if (!this.vinDecoder.validateVinFormat(createCarDto.vin)) {
      throw new BadRequestException('Invalid VIN format');
    }

    // Check if VIN already exists (exclude archived cars)
    const existingCar = await this.prisma.car.findFirst({
      where: { 
        vin: createCarDto.vin,
        isArchived: false,
      },
    });

    if (existingCar) {
      throw new ConflictException('Car with this VIN already exists');
    }

    // Decode VIN to get additional data
    let vinData = null;
    try {
      vinData = await this.vinDecoder.decodeVin(createCarDto.vin);
    } catch (error) {
      console.warn('VIN decoding failed, proceeding with manual data', error.message);
    }

    // Create car record
    const carData: Prisma.CarCreateInput = {
      vin: createCarDto.vin.toUpperCase(),
      make: createCarDto.make,
      model: createCarDto.model,
      year: createCarDto.year,
      color: createCarDto.color,
      condition: createCarDto.condition,
      mileage: createCarDto.mileage,
      location: createCarDto.location,
      purchaseDate: createCarDto.purchaseDate ? new Date(createCarDto.purchaseDate) : null,
      purchasePrice: createCarDto.purchasePrice,
      createdBy: createCarDto.createdBy || 'system',
      vinData: vinData ? (vinData as unknown as Prisma.InputJsonValue) : null,
    };

    return this.prisma.car.create({
      data: carData,
      include: {
        media: true,
        remarks: true,
        damages: true,
      },
    });
  }

  /**
   * Get all cars with optional filters
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.CarWhereInput;
    orderBy?: Prisma.CarOrderByWithRelationInput;
  }): Promise<{ data: Car[]; total: number }> {
    const { skip = 0, take = 20, where, orderBy } = params || {};

    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        skip,
        take,
        where: { ...where, isArchived: false },
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          media: {
            where: { type: 'IMAGE' },
            take: 1,
          },
          _count: {
            select: {
              media: true,
              remarks: true,
              damages: true,
            },
          },
        },
      }),
      this.prisma.car.count({ where: { ...where, isArchived: false } }),
    ]);

    return { data, total };
  }

  /**
   * Get car by ID
   */
  async findOne(id: string): Promise<Car> {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { uploadedAt: 'desc' },
        },
        remarks: {
          orderBy: { createdAt: 'desc' },
        },
        damages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  /**
   * Get car by VIN
   */
  async findByVin(vin: string): Promise<Car> {
    const car = await this.prisma.car.findUnique({
      where: { vin: vin.toUpperCase() },
      include: {
        media: {
          orderBy: { uploadedAt: 'desc' },
        },
        remarks: {
          orderBy: { createdAt: 'desc' },
        },
        damages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with VIN ${vin} not found`);
    }

    return car;
  }

  /**
   * Update car by ID
   */
  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    await this.findOne(id); // Check if exists

    // If VIN is being updated, check for conflicts
    if (updateCarDto.vin) {
      const existingCar = await this.prisma.car.findUnique({
        where: { vin: updateCarDto.vin.toUpperCase() },
      });

      if (existingCar && existingCar.id !== id) {
        throw new ConflictException('Another car with this VIN already exists');
      }
    }

    const updateData: Prisma.CarUpdateInput = {
      ...updateCarDto,
      vin: updateCarDto.vin?.toUpperCase(),
      purchaseDate: updateCarDto.purchaseDate ? new Date(updateCarDto.purchaseDate) : undefined,
    };

    return this.prisma.car.update({
      where: { id },
      data: updateData,
      include: {
        media: true,
        remarks: true,
        damages: true,
      },
    });
  }

  /**
   * Soft delete car (archive)
   */
  async remove(id: string): Promise<Car> {
    await this.findOne(id); // Check if exists

    return this.prisma.car.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  /**
   * Hard delete car (permanent)
   */
  async permanentDelete(id: string): Promise<Car> {
    await this.findOne(id); // Check if exists

    return this.prisma.car.delete({
      where: { id },
    });
  }

  /**
   * Decode VIN and return data without creating car
   */
  async decodeVinOnly(vin: string) {
    if (!this.vinDecoder.validateVinFormat(vin)) {
      throw new BadRequestException('Invalid VIN format');
    }

    return this.vinDecoder.decodeVin(vin);
  }

  /**
   * Get statistics
   */
  async getStats() {
    const [total, byCondition, recentlyAdded] = await Promise.all([
      this.prisma.car.count({ where: { isArchived: false } }),
      this.prisma.car.groupBy({
        by: ['condition'],
        where: { isArchived: false },
        _count: true,
      }),
      this.prisma.car.count({
        where: {
          isArchived: false,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      total,
      byCondition,
      recentlyAdded,
    };
  }
}
