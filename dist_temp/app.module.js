"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_entity_1 = require("./entities/user.entity");
const social_account_entity_1 = require("./entities/social-account.entity");
const content_draft_entity_1 = require("./entities/content-draft.entity");
const publish_task_entity_1 = require("./entities/publish-task.entity");
const customer_profile_entity_1 = require("./entities/customer-profile.entity");
const data_import_job_entity_1 = require("./entities/data-import-job.entity");
const customer_segment_entity_1 = require("./entities/customer-segment.entity");
const enterprise_profile_entity_1 = require("./entities/enterprise-profile.entity");
const knowledge_document_entity_1 = require("./entities/knowledge-document.entity");
const tenant_entity_1 = require("./entities/tenant.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
const workflow_entity_1 = require("./modules/workflow/entities/workflow.entity");
const workflow_node_entity_1 = require("./modules/workflow/entities/workflow-node.entity");
const approval_record_entity_1 = require("./modules/workflow/entities/approval-record.entity");
const notification_entity_1 = require("./modules/workflow/entities/notification.entity");
const geo_region_entity_1 = require("./modules/monitor/geo-analysis/entities/geo-region.entity");
const geo_analysis_result_entity_1 = require("./modules/monitor/geo-analysis/entities/geo-analysis-result.entity");
const seo_suggestion_entity_1 = require("./modules/monitor/geo-analysis/entities/seo-suggestion.entity");
const user_behavior_entity_1 = require("./modules/data-analytics/entities/user-behavior.entity");
const marketing_campaign_entity_1 = require("./modules/data-analytics/entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("./modules/data-analytics/entities/marketing-strategy.entity");
const data_analytics_module_1 = require("./modules/data-analytics/data-analytics.module");
const customer_data_module_1 = require("./modules/customer-data/customer-data.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const auth_module_1 = require("./modules/auth/auth.module");
const data_engine_module_1 = require("./modules/data-engine/data-engine.module");
const ai_engine_module_1 = require("./modules/ai-engine/ai-engine.module");
const workflow_module_1 = require("./modules/workflow/workflow.module");
const publish_module_1 = require("./modules/publish/publish.module");
const knowledge_module_1 = require("./modules/knowledge/knowledge.module");
const monitor_module_1 = require("./modules/monitor/monitor.module");
const user_module_1 = require("./modules/user/user.module");
const monitoring_module_1 = require("./shared/monitoring/monitoring.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 3306),
                    username: configService.get('DB_USERNAME', 'root'),
                    password: configService.get('DB_PASSWORD', ''),
                    database: configService.get('DB_DATABASE', 'lumina_media'),
                    entities: [
                        user_entity_1.User,
                        social_account_entity_1.SocialAccount,
                        content_draft_entity_1.ContentDraft,
                        publish_task_entity_1.PublishTask,
                        customer_profile_entity_1.CustomerProfile,
                        data_import_job_entity_1.DataImportJob,
                        customer_segment_entity_1.CustomerSegment,
                        enterprise_profile_entity_1.EnterpriseProfile,
                        knowledge_document_entity_1.KnowledgeDocument,
                        user_behavior_entity_1.UserBehavior,
                        marketing_campaign_entity_1.MarketingCampaign,
                        marketing_strategy_entity_1.MarketingStrategy,
                        tenant_entity_1.Tenant,
                        role_entity_1.Role,
                        permission_entity_1.Permission,
                        user_role_entity_1.UserRole,
                        workflow_entity_1.Workflow,
                        workflow_node_entity_1.WorkflowNode,
                        approval_record_entity_1.ApprovalRecord,
                        notification_entity_1.Notification,
                        geo_region_entity_1.GeoRegion,
                        geo_analysis_result_entity_1.GeoAnalysisResult,
                        seo_suggestion_entity_1.SeoSuggestion,
                    ],
                    synchronize: configService.get('TYPEORM_SYNCHRONIZE', 'false') === 'true',
                    logging: configService.get('TYPEORM_LOGGING', 'true') === 'true',
                    charset: 'utf8mb4',
                    extra: {
                        charset: 'utf8mb4',
                        init: (connection) => {
                            connection.query('SET NAMES utf8mb4');
                        },
                    },
                }),
            }),
            data_analytics_module_1.DataAnalyticsModule,
            customer_data_module_1.CustomerDataModule,
            dashboard_module_1.DashboardModule,
            auth_module_1.AuthModule,
            data_engine_module_1.DataEngineModule,
            ai_engine_module_1.AIEngineModule,
            workflow_module_1.WorkflowModule,
            publish_module_1.PublishModule,
            knowledge_module_1.KnowledgeModule,
            monitor_module_1.MonitorModule,
            user_module_1.UserModule,
            monitoring_module_1.MonitoringModule,
            health_module_1.HealthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map