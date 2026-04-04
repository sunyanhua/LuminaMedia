"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDataModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const customer_profile_entity_1 = require("../../entities/customer-profile.entity");
const data_import_job_entity_1 = require("../../entities/data-import-job.entity");
const customer_segment_entity_1 = require("../../entities/customer-segment.entity");
const customer_profile_repository_1 = require("../../shared/repositories/customer-profile.repository");
const data_import_job_repository_1 = require("../../shared/repositories/data-import-job.repository");
const customer_segment_repository_1 = require("../../shared/repositories/customer-segment.repository");
const customer_profile_service_1 = require("./services/customer-profile.service");
const data_import_service_1 = require("./services/data-import.service");
const customer_analytics_service_1 = require("./services/customer-analytics.service");
const customer_profile_controller_1 = require("./controllers/customer-profile.controller");
const data_import_controller_1 = require("./controllers/data-import.controller");
const customer_analytics_controller_1 = require("./controllers/customer-analytics.controller");
let CustomerDataModule = class CustomerDataModule {
};
exports.CustomerDataModule = CustomerDataModule;
exports.CustomerDataModule = CustomerDataModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_profile_entity_1.CustomerProfile,
                data_import_job_entity_1.DataImportJob,
                customer_segment_entity_1.CustomerSegment,
                customer_profile_repository_1.CustomerProfileRepository,
                data_import_job_repository_1.DataImportJobRepository,
                customer_segment_repository_1.CustomerSegmentRepository,
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [
            customer_profile_controller_1.CustomerProfileController,
            data_import_controller_1.DataImportController,
            customer_analytics_controller_1.CustomerAnalyticsController,
        ],
        providers: [
            customer_profile_service_1.CustomerProfileService,
            data_import_service_1.DataImportService,
            customer_analytics_service_1.CustomerAnalyticsService,
        ],
        exports: [
            customer_profile_service_1.CustomerProfileService,
            data_import_service_1.DataImportService,
            customer_analytics_service_1.CustomerAnalyticsService,
            typeorm_1.TypeOrmModule.forFeature([
                customer_profile_entity_1.CustomerProfile,
                data_import_job_entity_1.DataImportJob,
                customer_segment_entity_1.CustomerSegment,
                customer_profile_repository_1.CustomerProfileRepository,
                data_import_job_repository_1.DataImportJobRepository,
                customer_segment_repository_1.CustomerSegmentRepository,
            ]),
        ],
    })
], CustomerDataModule);
//# sourceMappingURL=customer-data.module.js.map