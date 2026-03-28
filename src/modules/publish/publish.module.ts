import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// 适配器
import { WechatAdapter } from './adapters/wechat.adapter';
import { XHSAdapter } from './adapters/xiaohongshu.adapter';
import { WeiboAdapter } from './adapters/weibo.adapter';
import { DouyinAdapter } from './adapters/douyin.adapter';
import { PlatformAdapterFactory } from './adapters/platform-adapter.factory';

// 服务
import { PublishService } from './services/publish.service';
import { WechatFormatterService } from './services/wechat-formatter.service';
import { AIImageGeneratorService } from './services/ai-image-generator.service';

// 控制器（稍后添加）
// import { PublishController } from './controllers/publish.controller';

// 实体和存储库（稍后添加）
// import { PublishRecord } from './entities/publish-record.entity';
// import { PublishRecordRepository } from './repositories/publish-record.repository';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    // PublishController,
  ],
  providers: [
    // 适配器工厂
    PlatformAdapterFactory,

    // 适配器（工厂会创建实例，这里注册类以便依赖注入）
    WechatAdapter,
    XHSAdapter,
    WeiboAdapter,
    DouyinAdapter,

    // 服务
    PublishService,
    WechatFormatterService,
    AIImageGeneratorService,

    // 存储库（稍后添加）
    // PublishRecordRepository,
  ],
  exports: [
    // 导出服务供其他模块使用
    PublishService,
    PlatformAdapterFactory,
    WechatFormatterService,
    AIImageGeneratorService,

    // 导出适配器（可选）
    WechatAdapter,
    XHSAdapter,
    WeiboAdapter,
    DouyinAdapter,
  ],
})
export class PublishModule {}
