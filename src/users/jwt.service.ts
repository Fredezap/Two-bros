import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {

  private readonly secret = process.env.JWT_SECRET || 'dev_secret';
  private readonly expiresIn = '7d';

  sign(payload: object, expiresIn?: string) {
    return jwt.sign(payload, this.secret, { expiresIn: expiresIn || this.expiresIn } as any);
  }

  verify<T = any>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}
