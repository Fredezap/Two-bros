export declare class EmailService {
    private transporter;
    sendVerificationEmail(to: string, token: string): Promise<void>;
    sendAccountLockedEmail(to: string, token: string): Promise<void>;
    sendResetPasswordEmail(to: string, token: string): Promise<void>;
}
