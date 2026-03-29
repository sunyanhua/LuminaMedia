import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// 服务
import { SentimentAnalysisService } from './services/sentiment-analysis.service';
import { GeminiSentimentProvider } from './services/gemini-sentiment.provider';
import { LexiconSentimentProvider } from './services/lexicon-sentiment.provider';

// 控制器
import { SentimentAnalysisController } from './controllers/sentiment-analysis.controller';

// 创建提供商实例
const sentimentProviders: Provider[] = [
  GeminiSentimentProvider,
  LexiconSentimentProvider,
  {
    provide: 'SENTIMENT_PROVIDERS',
    useFactory: (geminiProvider: GeminiSentimentProvider, lexiconProvider: LexiconSentimentProvider) => {
      return [geminiProvider, lexiconProvider];
    },
    inject: [GeminiSentimentProvider, LexiconSentimentProvider],
  },
];

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [SentimentAnalysisController],
  providers: [
    ...sentimentProviders,
    SentimentAnalysisService,
  ],
  exports: [
    SentimentAnalysisService,
    GeminiSentimentProvider,
    LexiconSentimentProvider,
  ],
})
export class SentimentAnalysisModule {}