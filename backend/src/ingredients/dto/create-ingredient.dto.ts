import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator'

export enum IngredientType {
  MALT = 'malt',
  HOP = 'hop',
  YEAST = 'yeast',
  OTHER = 'other',
}

export class CreateIngredientDto {
  @IsString()
  name!: string

  @IsEnum(IngredientType)
  type!: IngredientType

  @IsString()
  unitOfMeasure!: string

  @IsOptional()
  @IsNumber()
  stock!: number

  @IsOptional()
  @IsNumber()
  reorderThreshold?: number

  @IsOptional()
  isInStock?: boolean

  // Relación obligatoria con usuario
  @IsString()
  userId!: string
}
