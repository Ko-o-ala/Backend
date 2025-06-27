import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  private readonly validApiKey = process.env.INTERNAL_API_KEY;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || apiKey !== this.validApiKey) {
      throw new UnauthorizedException('유효하지 않은 API 키입니다.');
    }

    return true;
  }
}
