import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchCarsDto } from './dto/search-cars.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchCars(searchDto: SearchCarsDto) {
    const {
      vin,
      make,
      model,
      yearFrom,
      yearTo,
      condition,
      location,
      color,
      q,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    // Build where clause
    const andConditions: Prisma.CarWhereInput[] = [];
    const where: Prisma.CarWhereInput = {
      isArchived: false,
    };

    // General search query (searches across multiple fields)
    if (q) {
      const searchTerm = q.toLowerCase();
      where.OR = [
        { vin: { contains: searchTerm, mode: 'insensitive' } },
        { make: { contains: searchTerm, mode: 'insensitive' } },
        { model: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
        { color: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Specific filters
    if (vin) {
      andConditions.push({ vin: { contains: vin.toUpperCase(), mode: 'insensitive' } });
    }

    if (make) {
      andConditions.push({ make: { contains: make, mode: 'insensitive' } });
    }

    if (model) {
      andConditions.push({ model: { contains: model, mode: 'insensitive' } });
    }

    if (yearFrom) {
      andConditions.push({ year: { gte: yearFrom } });
    }

    if (yearTo) {
      andConditions.push({ year: { lte: yearTo } });
    }

    if (condition) {
      andConditions.push({ condition });
    }

    if (location) {
      andConditions.push({ location: { contains: location, mode: 'insensitive' } });
    }

    if (color) {
      andConditions.push({ color: { contains: color, mode: 'insensitive' } });
    }

    // Add AND conditions if any exist
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Build orderBy
    const orderBy: Prisma.CarOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          media: {
            where: { type: 'IMAGE' },
            take: 1,
            orderBy: { uploadedAt: 'desc' },
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
      this.prisma.car.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: searchDto,
    };
  }

  /**
   * Get unique values for filters (autocomplete)
   */
  async getFilterOptions() {
    const [makes, models, locations, colors, conditions] = await Promise.all([
      this.prisma.car.findMany({
        where: { isArchived: false },
        select: { make: true },
        distinct: ['make'],
        orderBy: { make: 'asc' },
      }),
      this.prisma.car.findMany({
        where: { isArchived: false },
        select: { model: true },
        distinct: ['model'],
        orderBy: { model: 'asc' },
      }),
      this.prisma.car.findMany({
        where: { isArchived: false, location: { not: null } },
        select: { location: true },
        distinct: ['location'],
        orderBy: { location: 'asc' },
      }),
      this.prisma.car.findMany({
        where: { isArchived: false, color: { not: null } },
        select: { color: true },
        distinct: ['color'],
        orderBy: { color: 'asc' },
      }),
      this.prisma.car.groupBy({
        by: ['condition'],
        where: { isArchived: false },
        _count: true,
      }),
    ]);

    return {
      makes: makes.map((m) => m.make),
      models: models.map((m) => m.model),
      locations: locations.map((l) => l.location),
      colors: colors.map((c) => c.color),
      conditions: conditions.map((c) => ({
        value: c.condition,
        count: c._count,
      })),
    };
  }
}
