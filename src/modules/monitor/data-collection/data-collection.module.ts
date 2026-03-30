import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// 实体
import { DataCollectionTask } from './entities/data-collection-task.entity';
import { PlatformConfig } from './entities/platform-config.entity';
import { CollectedData } from './entities/collected-data.entity';

// 服务
import { DataCollectionSchedulerService } from './services/data-collection-scheduler.service';
import { PlatformCollectorFactory } from './services/platform-collector.factory';
import { WeChatCollectorService } from './services/collectors/wechat-collector.service';
import { WeiboCollectorService } from './services/collectors/weibo-collector.service';
import { NewsCollectorService } from './services/collectors/news-collector.service';
import { DataCleaningService } from './services/data-cleaning.service';
import { ProxyPoolService } from './services/proxy-pool.service';
import { AntiCrawlerService } from './services/anti-crawler.service';

// 控制器
import { DataCollectionController } from './controllers/data-collection.controller';

// 处理器（Bull队列消费者）
import { DataCollectionProcessor } from './processors/data-collection.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DataCollectionTask,
      PlatformConfig,
      CollectedData,
    ]),
    BullModule.registerQueue({
      name: 'data-collection',
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
    }),
  ],
  controllers: [DataCollectionController],
  providers: [
    DataCollectionSchedulerService,
    PlatformCollectorFactory,
    WeChatCollectorService,
    WeiboCollectorService,
    NewsCollectorService,
    DataCleaningService,
    ProxyPoolService,
    AntiCrawlerService,
    DataCollectionProcessor,
  ],
  exports: [
    DataCollectionSchedulerService,
    PlatformCollectorFactory,
    DataCleaningService,
  ],
})
export class DataCollectionModule {}
