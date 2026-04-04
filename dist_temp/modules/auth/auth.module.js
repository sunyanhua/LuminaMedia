"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../../entities/user.entity");
const tenant_entity_1 = require("../../entities/tenant.entity");
const role_entity_1 = require("../../entities/role.entity");
const permission_entity_1 = require("../../entities/permission.entity");
const user_role_entity_1 = require("../../entities/user-role.entity");
const feature_config_entity_1 = require("../../entities/feature-config.entity");
const tenant_quota_entity_1 = require("../../entities/tenant-quota.entity");
const tenant_context_service_1 = require("../../shared/services/tenant-context.service");
const auth_service_1 = require("./services/auth.service");
const tenant_service_1 = require("./services/tenant.service");
const role_service_1 = require("./services/role.service");
const permission_service_1 = require("./services/permission.service");
const feature_config_service_1 = require("./services/feature-config.service");
const tenant_feature_service_1 = require("./services/tenant-feature.service");
const quota_service_1 = require("./services/quota.service");
const auth_controller_1 = require("./controllers/auth.controller");
const role_controller_1 = require("./controllers/role.controller");
const permission_controller_1 = require("./controllers/permission.controller");
const feature_config_controller_1 = require("./controllers/feature-config.controller");
const tenant_feature_controller_1 = require("./controllers/tenant-feature.controller");
const quota_controller_1 = require("./controllers/quota.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
const feature_guard_1 = require("./guards/feature.guard");
const quota_check_middleware_1 = require("./middlewares/quota-check.middleware");
const tenant_middleware_1 = require("./middlewares/tenant.middleware");
const user_module_1 = require("../user/user.module");
let AuthModule = class AuthModule {
    configure(consumer) {
        consumer
            .apply(tenant_middleware_1.TenantMiddleware, quota_check_middleware_1.QuotaCheckMiddleware)
            .forRoutes('*');
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, tenant_entity_1.Tenant, role_entity_1.Role, permission_entity_1.Permission, user_role_entity_1.UserRole, feature_config_entity_1.FeatureConfig, feature_config_entity_1.TenantFeatureToggle, tenant_quota_entity_1.TenantQuota]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET', 'your-secret-key'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
                    },
                }),
            }),
            user_module_1.UserModule,
        ],
        controllers: [
            auth_controller_1.AuthController,
            role_controller_1.RoleController,
            permission_controller_1.PermissionController,
            feature_config_controller_1.FeatureConfigController,
            tenant_feature_controller_1.TenantFeatureController,
            quota_controller_1.QuotaController
        ],
        providers: [
            auth_service_1.AuthService,
            tenant_service_1.TenantService,
            role_service_1.RoleService,
            permission_service_1.PermissionService,
            feature_config_service_1.FeatureConfigService,
            tenant_feature_service_1.TenantFeatureService,
            quota_service_1.QuotaService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            feature_guard_1.FeatureGuard,
            tenant_context_service_1.TenantContextService,
        ],
        exports: [
            auth_service_1.AuthService,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            feature_guard_1.FeatureGuard,
            tenant_context_service_1.TenantContextService,
            feature_config_service_1.FeatureConfigService,
            tenant_feature_service_1.TenantFeatureService,
            quota_service_1.QuotaService,
            typeorm_1.TypeOrmModule,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map