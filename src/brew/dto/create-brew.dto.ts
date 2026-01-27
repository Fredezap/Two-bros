import { IsString, IsUUID, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { BrewStatus } from '@prisma/client';

export class CreateBrewDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  recipeId: string;

  @IsNumber()
  batchLiters: number;

  @IsEnum(BrewStatus)
  @IsOptional()
  status?: BrewStatus;

  @IsDateString()
  @IsOptional()
  brewDate?: string;

  @IsDateString()
  @IsOptional()
  bottlingDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
