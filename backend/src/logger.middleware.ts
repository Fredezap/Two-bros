import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('--- [LOGGER MIDDLEWARE] Nueva request entrante ---');
    console.log('Método:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    console.log('Body:', req.body);
    console.log('-----------------------------------------------');
    next();
  }
}
