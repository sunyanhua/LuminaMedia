"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCollectionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const data_collection_task_entity_1 = require("./entities/data-collection-task.entity");
const platform_config_entity_1 = require("./entities/platform-config.entity");
const collected_data_entity_1 = require("./entities/collected-data.entity");
const data_collection_scheduler_service_1 = require("./services/data-collection-scheduler.service");
const platform_collector_factory_1 = require("./services/platform-collector.factory");
const wechat_collector_service_1 = require("./services/collectors/wechat-collector.service");
const weibo_collector_service_1 = require("./services/collectors/weibo-collector.service");
const news_collector_service_1 = require("./services/collectors/news-collector.service");
const data_cleaning_service_1 = require("./services/data-cleaning.service");
const proxy_pool_service_1 = require("./services/proxy-pool.service");
const anti_crawler_service_1 = require("./services/anti-crawler.service");
const data_collection_controller_1 = require("./controllers/data-collection.controller");
const data_collection_processor_1 = require("./processors/data-collection.processor");
let DataCollectionModule = class DataCollectionModule {
};
exports.DataCollectionModule = DataCollectionModule;
exports.DataCollectionModule = DataCollectionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                data_collection_task_entity_1.DataCollectionTask,
                platform_config_entity_1.PlatformConfig,
                collected_data_entity_1.CollectedData,
            ]),
            bull_1.BullModule.registerQueue({
                name: 'data-collection',
                redis: {
                    host: process.env.REDIS_HOST || 'redis',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD,
                    db: parseInt(process.env.REDIS_DB || '0'),
                },
            }),
        ],
        controllers: [data_collection_controller_1.DataCollectionController],
        providers: [
            data_collection_scheduler_service_1.DataCollectionSchedulerService,
            platform_collector_factory_1.PlatformCollectorFactory,
            wechat_collector_service_1.WeChatCollectorService,
            weibo_collector_service_1.WeiboCollectorService,
            news_collector_service_1.NewsCollectorService,
            data_cleaning_service_1.DataCleaningService,
            proxy_pool_service_1.ProxyPoolService,
            anti_crawler_service_1.AntiCrawlerService,
            data_collection_processor_1.DataCollectionProcessor,
        ],
        exports: [
            data_collection_scheduler_service_1.DataCollectionSchedulerService,
            platform_collector_factory_1.PlatformCollectorFactory,
            data_cleaning_service_1.DataCleaningService,
        ],
    })
], DataCollectionModule);
//# sourceMappingURL=data-collection.module.js.map