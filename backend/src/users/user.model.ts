export type User = {
  id: string;
  email: string;
  password: string; // Hasheada
  isEmailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpires: Date | null;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  // Puedes agregar campos para 2FA, dispositivos, etc.
};

export type CreateUserInput = Pick<User, 'email' | 'password'>;
