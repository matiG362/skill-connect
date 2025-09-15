import { Injectable } from '@nestjs/common';
import { SessionsClient } from '@google-cloud/dialogflow';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DialogflowService {
  private readonly sessionsClient: SessionsClient;
  private readonly projectId: string;

  constructor(private configService: ConfigService) {
    this.sessionsClient = new SessionsClient();
    this.projectId = this.configService.get<string>('DIALOGFLOW_PROJECT_ID');
  }

  async detectIntent(text: string, sessionId: string) {
    const sessionPath = this.sessionsClient.projectAgentSessionPath(
      this.projectId,
      sessionId,
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };

    const [response] = await this.sessionsClient.detectIntent(request);
    return response.queryResult;
  }
}
