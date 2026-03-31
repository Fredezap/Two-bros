export type User = {
    id: string;
    email: string;
    password: string;
    isEmailVerified: boolean;
    verificationToken: string | null;
    verificationTokenExpires: Date | null;
    failedLoginAttempts: number;
    lockUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    lastLoginIp: string | null;
};
export type CreateUserInput = Pick<User, 'email' | 'password'>;
