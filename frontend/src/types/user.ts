// Este tipo refleja el modelo User completo del backend
export interface User {
  id: string;
  email: string;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockUntil: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  // Puedes agregar más campos si los necesitas
}
