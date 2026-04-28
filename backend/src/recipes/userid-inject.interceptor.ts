import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserIdInjectInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    // Log siempre el método y userId
    const userId = req.user?.sub;
    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedException('No autorizado: userId faltante o inválido');
    }
    // Solo para POST (crear) inyectar userId
    if (req.method === 'POST') {
      req.body = { ...req.body, userId };
    }
    return next.handle();
  }
}