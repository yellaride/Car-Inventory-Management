import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Storage service for handling file storage
 * Supports local storage and can be extended for cloud storage (S3, R2)
 */
@Injectable()
export class StorageService {
  private readonly storageProvider: string;
  private readonly uploadDir: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.storageProvider = this.configService.get<string>('STORAGE_PROVIDER') || 'local';
    this.uploadDir = './uploads';
    this.publicUrl = this.configService.get<string>('STORAGE_PUBLIC_URL') || 'http://localhost:3001/uploads';

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Generate a presigned/upload URL
   * For local storage, returns a direct upload endpoint
   * For cloud storage (S3/R2), would generate presigned URL
   */
  async generateUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(fileName);
    const uniqueFileName = `${timestamp}-${randomString}${ext}`;

    if (this.storageProvider === 'local') {
      return {
        uploadUrl: `${this.publicUrl}/${uniqueFileName}`, // Direct upload endpoint
        fileUrl: `${this.publicUrl}/${uniqueFileName}`,
      };
    }

    // TODO: Implement S3/R2 presigned URL generation here
    // Example for S3:
    // const s3 = new S3Client({ ... });
    // const command = new PutObjectCommand({ Bucket, Key, ContentType });
    // const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    throw new Error('Cloud storage not yet implemented');
  }

  /**
   * Get file info from local storage
   */
  getFileInfo(fileName: string) {
    const filePath = path.join(this.uploadDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      url: `${this.publicUrl}/${fileName}`,
    };
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      if (this.storageProvider === 'local') {
        const filePath = path.join(this.uploadDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return true;
        }
      }

      // TODO: Implement cloud storage deletion
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get storage type
   */
  getStorageType(): string {
    return this.storageProvider;
  }
}
