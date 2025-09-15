// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module'; // <-- 1. Import the UsersModule
import { ServicesModule } from './services/services.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { PaymentsModule } from './payments/payments.module';
import { EventEmitterModule } from './event-emitter/event-emitter.module';
import { DialogflowModule } from './dialogflow/dialogflow.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule, // <-- 2. Add it to the imports array
    PrismaModule, ServicesModule, PaymentsModule, EventEmitterModule, DialogflowModule, ReviewsModule,
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatGateway, ChatService],
})
export class AppModule {}
