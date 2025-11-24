import { IsString, IsOptional, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  senderEmail?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  recipientEmails?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  downloadLimit?: number;
}

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
