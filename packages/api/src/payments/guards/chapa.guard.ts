// src/payments/guards/chapa.guard.ts
import { Injectable, CanActivate, ExecutionContext, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ChapaGuard implements CanActivate {
  private readonly chapaWebhookSecret: string;

  constructor(private configService: ConfigService) {
    this.chapaWebhookSecret = this.configService.get<string>('CHAPA_WEBHOOK_SECRET');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
    const signature = request.headers['x-chapa-signature'];
    
    console.log('[ChapaGuard] Received signature:', signature);
    console.log('[ChapaGuard] Raw body received:', request.rawBody?.toString());

    if (!signature || !request.rawBody) {
      console.error('[ChapaGuard] Missing signature or raw body.');
      return false;
    }

    const hash = crypto
      .createHmac('sha256', this.chapaWebhookSecret)
      .update(request.rawBody)
      .digest('hex');

    console.log('[ChapaGuard] Generated hash:', hash);
    
    const isVerified = hash === signature;
    console.log('[ChapaGuard] Verification result:', isVerified);

    return isVerified;
  }
}
