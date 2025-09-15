import { Module } from '@nestjs/common';
import { DialogflowService } from './dialogflow.service';
import { DialogflowController } from './dialogflow.controller';
import { ConfigModule } from '@nestjs/config'; // <-- Import

@Module({
  imports: [ConfigModule], // <-- Add
  controllers: [DialogflowController],
  providers: [DialogflowService],
})
export class DialogflowModule {}
