import { IsString, IsUUID, IsNumber, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { BrewStatus } from '@prisma/client';

export class CreateBrewDto {
  @IsUUID()
  @IsOptional()
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

  @IsOptional()
  @IsDateString()
  bottlingDate?: string | null;

  @IsString()
  @IsOptional()
  notes?: string;
}