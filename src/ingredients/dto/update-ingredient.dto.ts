import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator'
import { IngredientType } from './create-ingredient.dto'

export class UpdateIngredientDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsEnum(IngredientType)
	type?: IngredientType

	@IsOptional()
	@IsString()
	unitOfMeasure?: string

	@IsOptional()
	@IsNumber()
	stock?: number

	@IsOptional()
	@IsNumber()
	reorderThreshold?: number

	@IsOptional()
	isInStock?: boolean
}
