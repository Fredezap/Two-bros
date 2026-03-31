export declare class JwtService {
    private readonly secret;
    private readonly expiresIn;
    sign(payload: object, expiresIn?: string): string;
    verify<T = any>(token: string): T;
}
