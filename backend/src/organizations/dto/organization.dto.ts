import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionTier, AuthProvider } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ required: false })
  @IsEnum(SubscriptionTier)
  @IsOptional()
  tier?: SubscriptionTier;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStorageBytes?: number;
}

export class UpdateOrganizationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ required: false })
  @IsEnum(SubscriptionTier)
  @IsOptional()
  tier?: SubscriptionTier;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxStorageBytes?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  ssoEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  defaultTransferExpiryDays?: number;
}
