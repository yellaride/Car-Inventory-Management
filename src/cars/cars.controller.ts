import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { DecodeVinDto } from './dto/decode-vin.dto';

@ApiTags('cars')
@Controller('cars')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new car record' })
  @ApiResponse({ status: 201, description: 'Car created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid VIN or data' })
  @ApiResponse({ status: 409, description: 'Car with this VIN already exists' })
  create(@Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cars with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of cars returned' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const result = await this.carsService.findAll({
      skip,
      take: limitNum,
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
  @ApiOperation({ summary: 'Get car statistics' })
  @ApiResponse({ status: 200, description: 'Statistics returned' })
  getStats() {
    return this.carsService.getStats();
  }

  @Post('decode-vin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decode VIN and get car details' })
  @ApiResponse({ status: 200, description: 'VIN decoded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid VIN format' })
  decodeVin(@Body() decodeVinDto: DecodeVinDto) {
    return this.carsService.decodeVinOnly(decodeVinDto.vin);
  }

  @Get('vin/:vin')
  @ApiOperation({ summary: 'Get car by VIN' })
  @ApiResponse({ status: 200, description: 'Car found' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  findByVin(@Param('vin') vin: string) {
    return this.carsService.findByVin(vin);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car by ID' })
  @ApiResponse({ status: 200, description: 'Car found' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update car by ID' })
  @ApiResponse({ status: 200, description: 'Car updated successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(id, updateCarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive car (soft delete)' })
  @ApiResponse({ status: 200, description: 'Car archived successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete car' })
  @ApiResponse({ status: 204, description: 'Car deleted permanently' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  permanentDelete(@Param('id') id: string) {
    return this.carsService.permanentDelete(id);
  }
}
