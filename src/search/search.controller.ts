import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from './search.service';
import { SearchCarsDto } from './dto/search-cars.dto';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search cars with filters' })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  search(@Query() searchDto: SearchCarsDto) {
    return this.searchService.searchCars(searchDto);
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Get available filter options for autocomplete' })
  @ApiResponse({ status: 200, description: 'Filter options returned' })
  getFilterOptions() {
    return this.searchService.getFilterOptions();
  }
}
