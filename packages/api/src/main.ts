// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{ 
    rawBody: true,
 });

  app.enableCors();

  // This ensures our DTO validation rules are always checked
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));

  // --- Swagger Configuration ---
  const config = new DocumentBuilder()
    .setTitle('SkillConnect API')
    .setDescription('The official API documentation for the SkillConnect application.')
    .setVersion('1.0')
    .addBearerAuth() // This adds the "Authorize" button for JWTs
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // This creates the actual webpage for our documentation at the /api route
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
