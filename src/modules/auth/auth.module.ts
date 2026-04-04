import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { UserRole } from '../../entities/user-role.entity';
import { FeatureConfig, TenantFeatureToggle } from '../../entities/feature-config.entity';
import { TenantQuota } from '../../entities/tenant-quota.entity';
import { TenantContextService } from '../../shared/services/tenant-context.service';
import { AuthService } from './services/auth.service';
import { TenantService } from './services/tenant.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { FeatureConfigService } from './services/feature-config.service';
import { TenantFeatureService } from './services/tenant-feature.service';
import { QuotaService } from './services/quota.service';
import { AuthController } from './controllers/auth.controller';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { FeatureConfigController } from './controllers/feature-config.controller';
import { TenantFeatureController } from './controllers/tenant-feature.controller';
import { QuotaController } from './controllers/quota.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { FeatureGuard } from './guards/feature.guard';
import { QuotaCheckMiddleware } from './middlewares/quota-check.middleware';
import { TenantMiddleware } from './middlewares/tenant.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Role, Permission, UserRole, FeatureConfig, TenantFeatureToggle, TenantQuota]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
    UserModule, // 导入UserModule以获取UserService
  ],
  controllers: [
    AuthController,
    RoleController,
    PermissionController,
    FeatureConfigController,
    TenantFeatureController,
    QuotaController
  ],
  providers: [
    AuthService,
    TenantService,
    RoleService,
    PermissionService,
    FeatureConfigService,
    TenantFeatureService,
    QuotaService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    FeatureGuard,
    TenantContextService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    FeatureGuard,
    TenantContextService,
    FeatureConfigService,
    TenantFeatureService,
    QuotaService,
    TypeOrmModule,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware, QuotaCheckMiddleware)
      .forRoutes('*'); // 应用到所有路由
  }
}