// src/event-emitter/event-emitter.module.ts
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule as NestEventEmitterModule } from '@nestjs/event-emitter';

@Global() // This makes it available everywhere
@Module({
  imports: [NestEventEmitterModule.forRoot()],
  exports: [NestEventEmitterModule],
})
export class EventEmitterModule {}
