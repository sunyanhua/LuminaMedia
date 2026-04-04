"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantFilterSubscriber = void 0;
const typeorm_1 = require("typeorm");
const tenant_context_service_1 = require("../services/tenant-context.service");
let TenantFilterSubscriber = class TenantFilterSubscriber {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
        dataSource.subscribers.push(this);
    }
    hasTenantId(entity) {
        return entity ? 'tenantId' in entity : false;
    }
    getCurrentTenantId() {
        return tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
    }
    afterLoad(entity, event) {
    }
    beforeInsert(event) {
        if (this.hasTenantId(event.entity)) {
            const tenantId = this.getCurrentTenantId();
            if (!event.entity.tenantId) {
                event.entity.tenantId = tenantId;
            }
        }
    }
    async beforeUpdate(event) {
        if (this.hasTenantId(event.entity) && event.entity) {
        }
        await this.checkTenantPermission(event);
    }
    async beforeRemove(event) {
        if (this.hasTenantId(event.entity) && event.entity) {
        }
        await this.checkTenantPermission(event);
    }
    async checkTenantPermission(event) {
        const eventAny = event;
        const entityId = eventAny.entityId || (event.entity && event.entity.id);
        if (!entityId) {
            return;
        }
        const entityTarget = event.metadata?.target || eventAny.entityTarget;
        if (!entityTarget) {
            return;
        }
        const repository = this.dataSource.getRepository(entityTarget);
        const metadata = repository.metadata;
        const tenantIdColumn = metadata.columns.find((col) => col.propertyName === 'tenantId');
        if (!tenantIdColumn) {
            return;
        }
        const currentTenantId = this.getCurrentTenantId();
        if (!currentTenantId) {
            return;
        }
        const entity = await repository.findOne({
            where: { id: entityId },
            select: ['tenantId'],
        });
        if (!entity) {
            return;
        }
        if (entity.tenantId !== currentTenantId) {
            throw new Error(`无权访问租户ID为${entity.tenantId}的数据`);
        }
    }
};
exports.TenantFilterSubscriber = TenantFilterSubscriber;
exports.TenantFilterSubscriber = TenantFilterSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TenantFilterSubscriber);
//# sourceMappingURL=tenant-filter.subscriber.js.map