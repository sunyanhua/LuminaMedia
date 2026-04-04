"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const platform_adapter_factory_1 = require("./adapters/platform-adapter.factory");
const publish_service_1 = require("./services/publish.service");
const wechat_formatter_service_1 = require("./services/wechat-formatter.service");
const ai_image_generator_service_1 = require("./services/ai-image-generator.service");
const account_credential_service_1 = require("./services/account-credential.service");
const account_connection_test_service_1 = require("./services/account-connection-test.service");
const government_content_service_1 = require("./services/government-content.service");
const compliance_check_service_1 = require("./services/compliance-check.service");
const social_account_entity_1 = require("../../entities/social-account.entity");
const account_controller_1 = require("./controllers/account.controller");
const government_controller_1 = require("./controllers/government.controller");
let PublishModule = class PublishModule {
};
exports.PublishModule = PublishModule;
exports.PublishModule = PublishModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([social_account_entity_1.SocialAccount]),
            auth_module_1.AuthModule,
        ],
        controllers: [
            account_controller_1.AccountController,
            government_controller_1.GovernmentController,
        ],
        providers: [
            platform_adapter_factory_1.PlatformAdapterFactory,
            publish_service_1.PublishService,
            wechat_formatter_service_1.WechatFormatterService,
            ai_image_generator_service_1.AIImageGeneratorService,
            account_credential_service_1.AccountCredentialService,
            account_connection_test_service_1.AccountConnectionTestService,
            government_content_service_1.GovernmentContentService,
            compliance_check_service_1.ComplianceCheckService,
        ],
        exports: [
            publish_service_1.PublishService,
            platform_adapter_factory_1.PlatformAdapterFactory,
            wechat_formatter_service_1.WechatFormatterService,
            ai_image_generator_service_1.AIImageGeneratorService,
            account_credential_service_1.AccountCredentialService,
            account_connection_test_service_1.AccountConnectionTestService,
            government_content_service_1.GovernmentContentService,
            compliance_check_service_1.ComplianceCheckService,
        ],
    })
], PublishModule);
//# sourceMappingURL=publish.module.js.map