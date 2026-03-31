import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from './jwt.service';
export declare class JwtAuthGuard implements CanActivate {
    private jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean;
}
