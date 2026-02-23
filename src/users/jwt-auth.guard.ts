import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { Request } from 'express';

type JwtPayload = { sub: string; email: string };
interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    let token = null;
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.replace('Bearer ', '');
    } else if (req.cookies && req.cookies['access_token']) {
      token = req.cookies['access_token'];
    }
    if (!token) throw new UnauthorizedException('Token requerido');
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
