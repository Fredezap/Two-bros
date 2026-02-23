import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Debes ingresar un email válido.' })
  email: string;

  @IsString({ message: 'La contraseña es obligatoria.' })
  password: string;

  @IsString({ message: 'El identificador de dispositivo es obligatorio.' })
  deviceId: string;

  @IsString({ message: 'El nombre del dispositivo es obligatorio.' })
  deviceName?: string;
}

