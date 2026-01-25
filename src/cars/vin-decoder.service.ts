import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface VinDecodedData {
  make: string;
  model: string;
  year: number;
  bodyClass?: string;
  engineCylinders?: string;
  engineModel?: string;
  fuelType?: string;
  manufacturer?: string;
  vehicleType?: string;
  plantCountry?: string;
  raw?: any;
}

@Injectable()
export class VinDecoderService {
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('VIN_DECODER_API_URL') || 'https://vpic.nhtsa.dot.gov/api';
  }

  /**
   * Decode VIN using NHTSA API (free, no auth required)
   */
  async decodeVin(vin: string): Promise<VinDecodedData> {
    try {
      const url = `${this.baseUrl}/vehicles/DecodeVin/${vin}?format=json`;
      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.Message && response.data.Message.includes('error')) {
        throw new HttpException('Invalid VIN or API error', HttpStatus.BAD_REQUEST);
      }

      const results = response.data.Results;
      
      // Extract relevant fields
      const decodedData: VinDecodedData = {
        make: this.extractValue(results, 'Make') || 'Unknown',
        model: this.extractValue(results, 'Model') || 'Unknown',
        year: parseInt(this.extractValue(results, 'Model Year') || new Date().getFullYear().toString()),
        bodyClass: this.extractValue(results, 'Body Class'),
        engineCylinders: this.extractValue(results, 'Engine Number of Cylinders'),
        engineModel: this.extractValue(results, 'Engine Model'),
        fuelType: this.extractValue(results, 'Fuel Type - Primary'),
        manufacturer: this.extractValue(results, 'Manufacturer Name'),
        vehicleType: this.extractValue(results, 'Vehicle Type'),
        plantCountry: this.extractValue(results, 'Plant Country'),
        raw: results, // Store full response for reference
      };

      return decodedData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Failed to decode VIN: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Extract value from NHTSA API response
   */
  private extractValue(results: any[], variableName: string): string | null {
    const item = results.find((r) => r.Variable === variableName);
    return item?.Value || null;
  }

  /**
   * Validate VIN format (basic check)
   */
  validateVinFormat(vin: string): boolean {
    // VIN must be 17 characters, alphanumeric, exclude I, O, Q
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }
}
