import { PartialType } from '@nestjs/mapped-types';
import { CreateStyleDto } from './create-style.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStyleDto extends PartialType(CreateStyleDto) {
	@IsOptional()
	@IsString()
	@MinLength(1, { message: 'Name must not be empty' })
	name?: string;
}
