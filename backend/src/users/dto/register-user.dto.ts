import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Debes ingresar un email válido.' })
  email!: string;

  @IsString({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo.'
  })
  password!: string;
}

