

import { IsOptional, IsNumber, IsUUID, IsString } from 'class-validator';

export class UpdateRecipeDto {
	@IsOptional()
	@IsString()
	userId?: string;
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
	details?: {
		og?: number | null;
		fg?: number | null;
		mashWater?: number | null;
		spargeWater?: number | null;
		[key: string]: any;
	};

	@IsOptional()
	ingredients?: any[];
}
