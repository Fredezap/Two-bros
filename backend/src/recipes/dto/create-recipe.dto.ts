import { IsString, IsOptional, IsNumber, IsUUID, IsObject, IsArray } from 'class-validator';


export class CreateRecipeDto {
  @IsString({ message: 'userId debe ser un string' })
  userId!: string;
  @IsOptional()
  @IsUUID()
  styleId?: string;

  @IsString()
  name!: string;

  @IsNumber()
  batchLiters!: number;

  @IsOptional()
  @IsNumber()
  ibu?: number;

  @IsOptional()
  @IsNumber()
  colorSrm?: number;

  @IsOptional()
  @IsNumber()
  alcoholPercent?: number;

  @IsOptional()
  @IsObject()
  details?: {
    og?: number | null;
    fg?: number | null;
    mashWater?: number | null;
    spargeWater?: number | null;
    [key: string]: any;
  };

  @IsOptional()
  @IsArray()
  ingredients?: any[];
}