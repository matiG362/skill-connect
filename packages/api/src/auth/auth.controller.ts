// src/auth/auth.controller.ts

// src/auth/auth.controller.ts

// Import HttpCode and HttpStatus
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common'; 
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// ... (DTOs are unchanged)
class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  // Add the @HttpCode decorator here
  @HttpCode(HttpStatus.OK) // HttpStatus.OK is just an enum for the number 200
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
