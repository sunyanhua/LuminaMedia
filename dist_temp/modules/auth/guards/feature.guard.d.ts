import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TenantFeatureService } from '../services/tenant-feature.service';
import { FeatureConfigService } from '../services/feature-config.service';
export declare class FeatureGuard implements CanActivate {
    private reflector;
    private tenantFeatureService;
    private featureConfigService;
    constructor(reflector: Reflector, tenantFeatureService: TenantFeatureService, featureConfigService: FeatureConfigService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private checkTenantFeatures;
}
