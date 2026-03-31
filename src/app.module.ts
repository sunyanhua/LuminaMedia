import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { SocialAccount } from './entities/social-account.entity';
import { ContentDraft } from './entities/content-draft.entity';
import { PublishTask } from './entities/publish-task.entity';
import { CustomerProfile } from './entities/customer-profile.entity';
import { DataImportJob } from './entities/data-import-job.entity';
import { CustomerSegment } from './entities/customer-segment.entity';
import { EnterpriseProfile } from './entities/enterprise-profile.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { Tenant } from './entities/tenant.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { Workflow } from './modules/workflow/entities/workflow.entity';
import { WorkflowNode } from './modules/workflow/entities/workflow-node.entity';
import { ApprovalRecord } from './modules/workflow/entities/approval-record.entity';
import { Notification } from './modules/workflow/entities/notification.entity';
import { GeoRegion } from './modules/monitor/geo-analysis/entities/geo-region.entity';
import { GeoAnalysisResult } from './modules/monitor/geo-analysis/entities/geo-analysis-result.entity';
import { SeoSuggestion } from './modules/monitor/geo-analysis/entities/seo-suggestion.entity';
import { UserBehavior } from './modules/data-analytics/entities/user-behavior.entity';
import { MarketingCampaign } from './modules/data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from './modules/data-analytics/entities/marketing-strategy.entity';
import { DataAnalyticsModule } from './modules/data-analytics/data-analytics.module';
import { CustomerDataModule } from './modules/customer-data/customer-data.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { DataEngineModule } from './modules/data-engine/data-engine.module';
import { AIEngineModule } from './modules/ai-engine/ai-engine.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { PublishModule } from './modules/publish/publish.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { UserModule } from './modules/user/user.module';
import { MonitoringModule } from './shared/monitoring/monitoring.module';
import { LoggingModule } from './shared/monitoring/logging/logging.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'lumina_media'),
        entities: [
          User,
          SocialAccount,
          ContentDraft,
          PublishTask,
          CustomerProfile,
          DataImportJob,
          CustomerSegment,
          EnterpriseProfile,
          KnowledgeDocument,
          UserBehavior,
          MarketingCampaign,
          MarketingStrategy,
          Tenant,
          Role,
          Permission,
          UserRole,
          Workflow,
          WorkflowNode,
          ApprovalRecord,
          Notification,
          GeoRegion,
          GeoAnalysisResult,
          SeoSuggestion,
        ],
        synchronize:
          configService.get('TYPEORM_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get('TYPEORM_LOGGING', 'true') === 'true',
        charset: 'utf8mb4',
        extra: {
          charset: 'utf8mb4',
          init: (connection: import('mysql2').Connection) => {
            connection.query('SET NAMES utf8mb4');
          },
        },
      }),
    }),
    DataAnalyticsModule,
    CustomerDataModule,
    DashboardModule,
    AuthModule,
    DataEngineModule,
    AIEngineModule,
    WorkflowModule,
    PublishModule,
    KnowledgeModule,
    MonitorModule,
    UserModule,
    MonitoringModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
