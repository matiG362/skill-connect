import { Controller, Post, Body } from '@nestjs/common';
import { DialogflowService } from './dialogflow.service';
import { QueryDto } from './dto/query.dto';
import { ApiTags } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';

@ApiTags('dialogflow')
@Controller('dialogflow')
export class DialogflowController {
  constructor(private readonly dialogflowService: DialogflowService) {}

  @Post('query')
  async query(@Body() queryDto: QueryDto) {
    const sessionId = uuid(); 
    const result = await this.dialogflowService.detectIntent(queryDto.text, sessionId);
    // Let's return a cleaner response to the frontend
    return {
      fulfillmentText: result.fulfillmentText,
      intent: {
        displayName: result.intent.displayName,
      }
    }
  }
}
