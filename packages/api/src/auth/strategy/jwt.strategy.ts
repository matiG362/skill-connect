// src/auth/strategy/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // We give this strategy a default name of 'jwt'
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from "Bearer <token>" header
      secretOrKey: config.get('JWT_SECRET'), // Use the same secret to verify the token
    });
  }

  // This method runs AFTER the token has been successfully verified
  async validate(payload: { sub: number; email: string }) {
    // The 'payload' is the decoded object from our JWT
    // { sub: user.id, email: user.email }
    
    // We can use the payload to find the full user object from the database
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    // NestJS will attach this returned user object to the request object
    // as request.user
    delete user.password;
    return user;
  }
}
