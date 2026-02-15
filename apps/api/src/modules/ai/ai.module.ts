import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LLM_PROVIDER } from './providers/llm-provider.interface';
import { MockLLMProvider } from './providers/mock.provider';

@Module({
  controllers: [AiController],
  providers: [
    {
      provide: LLM_PROVIDER,
      useFactory: (config: ConfigService) => {
        const useMock = config.get<string>('USE_MOCK_LLM', 'true') === 'true';
        if (useMock) {
          return new MockLLMProvider();
        }
        // In production: return new OpenAIProvider(config.get('OPENAI_API_KEY'))
        return new MockLLMProvider();
      },
      inject: [ConfigService],
    },
    AiService,
  ],
})
export class AiModule {}
