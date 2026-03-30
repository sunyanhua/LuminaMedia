import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { AccountCredentialService } from './services/account-credential.service';
import { AccountConnectionTestService } from './services/account-connection-test.service';
import { GovernmentContentService } from './services/government-content.service';
import { ComplianceCheckService } from './services/compliance-check.service';

// 实体
import { SocialAccount } from '../../entities/social-account.entity';

// 控制器
import { AccountController } from './controllers/account.controller';
import { GovernmentController } from './controllers/government.controller';
// import { PublishController } from './controllers/publish.controller';

// 实体和存储库（稍后添加）
// import { PublishRecord } from './entities/publish-record.entity';
// import { PublishRecordRepository } from './repositories/publish-record.repository';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([SocialAccount]),
  ],
  controllers: [
    AccountController,
    GovernmentController,
    // PublishController,
  ],
  providers: [
    // 适配器工厂
    PlatformAdapterFactory,

    // 服务
    PublishService,
    WechatFormatterService,
    AIImageGeneratorService,
    AccountCredentialService,
    AccountConnectionTestService,
    GovernmentContentService,
    ComplianceCheckService,

    // 存储库（稍后添加）
    // PublishRecordRepository,
  ],
  exports: [
    // 导出服务供其他模块使用
    PublishService,
    PlatformAdapterFactory,
    WechatFormatterService,
    AIImageGeneratorService,
    AccountCredentialService,
    AccountConnectionTestService,
    GovernmentContentService,
    ComplianceCheckService,
  ],
})
export class PublishModule {}
