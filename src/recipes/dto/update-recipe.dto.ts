
import { IsString, IsOptional, IsNumber, IsUUID, IsObject, IsArray } from 'class-validator';

export class UpdateRecipeDto {
	@IsOptional()
	@IsUUID()
	styleId?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsNumber()
	batchLiters?: number;

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
	details?: any;

	@IsOptional()
	@IsArray()
	ingredients?: any[];
}
