import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TenantFeatureService } from '../services/tenant-feature.service';
import { FeatureConfigService } from '../services/feature-config.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantFeatureService: TenantFeatureService,
    private featureConfigService: FeatureConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredFeatures = this.reflector.getAllAndOverride<string[]>('features', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeatures || requiredFeatures.length === 0) {
      return true; // 如果没有指定功能要求，则允许访问
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];

    if (!tenantId) {
      return false; // 如果无法确定租户ID，则拒绝访问
    }

    // 检查租户是否有访问所需功能的权限
    return this.checkTenantFeatures(tenantId, requiredFeatures);
  }

  private async checkTenantFeatures(tenantId: string, features: string[]): Promise<boolean> {
    for (const feature of features) {
      const hasAccess = await this.featureConfigService.canTenantUseFeature(tenantId, feature);

      if (!hasAccess) {
        return false; // 如果租户无法访问任何一个所需功能，则拒绝访问
      }
    }

    return true;
  }
}