import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateStyleDto {
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
