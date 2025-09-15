// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; // <-- Import
import { ConfigService } from '@nestjs/config'; // <-- Import
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService], // Inject ConfigService to read .env
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'), // Use our secret from .env
          signOptions: { expiresIn: '60m' }, // Tokens will expire in 60 minutes
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
