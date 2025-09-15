import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from '../chat/chat.module'; 

@Module({
  imports: [ConfigModule, ChatModule], 
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
