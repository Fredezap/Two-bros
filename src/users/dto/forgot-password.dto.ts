import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Debes ingresar un email válido.' })
  email: string;
}
