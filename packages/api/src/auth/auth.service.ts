// src/auth/auth.service.ts
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// Import Prisma types to check for specific error codes
import { Prisma } from '../../generated/prisma';

@Injectable()
export class AuthService {
  // Inject both PrismaService and JwtService
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(email: string, pass: string) {
    // 1. Hash the incoming password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    try {
      // 2. Try to create the user in the database
      const user = await this.prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
        },
      });

      // 3. Return the newly created user (without the password)
      delete user.password;
      return user;

    } catch (error) {
      // 4. If an error occurs, check if it's the specific 'unique constraint' error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // P2002 is the Prisma error code for a unique constraint violation
          // If it is, throw a more user-friendly 'Forbidden' exception
          throw new ForbiddenException('Credentials taken');
        }
      }
      // 5. If it's any other error, just throw it as is
      throw error;
    }
  }

  // login method is unchanged
  async login(email: string, pass: string) {
    // 1. Find the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    // 2. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    // 3. If passwords match, generate a JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    // 4. Return the token
    return {
      access_token: accessToken,
    };
  }
}
