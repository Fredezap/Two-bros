import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString({ message: 'El token es obligatorio.' })
  token!: string;
}
