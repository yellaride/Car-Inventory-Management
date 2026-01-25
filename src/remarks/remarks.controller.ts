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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RemarksService } from './remarks.service';
import { CreateRemarkDto } from './dto/create-remark.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';

@ApiTags('remarks')
@Controller('remarks')
export class RemarksController {
  constructor(private readonly remarksService: RemarksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new remark for a car' })
  @ApiResponse({ status: 201, description: 'Remark created successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  create(@Body() createRemarkDto: CreateRemarkDto) {
    return this.remarksService.create(createRemarkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all remarks with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of remarks returned' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('type') type?: string,
    @Query('priority') priority?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const result = await this.remarksService.findAll({
      skip,
      take: limitNum,
      type,
      priority,
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
  @ApiOperation({ summary: 'Get remark statistics' })
  @ApiResponse({ status: 200, description: 'Statistics returned' })
  getStats() {
    return this.remarksService.getRemarkStats();
  }

  @Get('car/:carId')
  @ApiOperation({ summary: 'Get all remarks for a specific car' })
  @ApiResponse({ status: 200, description: 'Remarks returned' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  findByCarId(@Param('carId') carId: string) {
    return this.remarksService.findByCarId(carId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get remark by ID' })
  @ApiResponse({ status: 200, description: 'Remark found' })
  @ApiResponse({ status: 404, description: 'Remark not found' })
  findOne(@Param('id') id: string) {
    return this.remarksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update remark by ID' })
  @ApiResponse({ status: 200, description: 'Remark updated successfully' })
  @ApiResponse({ status: 404, description: 'Remark not found' })
  update(@Param('id') id: string, @Body() updateRemarkDto: UpdateRemarkDto) {
    return this.remarksService.update(id, updateRemarkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete remark by ID' })
  @ApiResponse({ status: 204, description: 'Remark deleted successfully' })
  @ApiResponse({ status: 404, description: 'Remark not found' })
  remove(@Param('id') id: string) {
    return this.remarksService.remove(id);
  }
}
