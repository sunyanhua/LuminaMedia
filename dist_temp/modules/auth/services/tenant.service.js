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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../../../entities/tenant.entity");
let TenantService = class TenantService {
    tenantRepository;
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    async create(createTenantDto) {
        const existingTenant = await this.tenantRepository.findOne({
            where: { name: createTenantDto.name },
        });
        if (existingTenant) {
            throw new common_1.ConflictException('租户名称已存在');
        }
        const tenant = this.tenantRepository.create(createTenantDto);
        return await this.tenantRepository.save(tenant);
    }
    async findAll() {
        return await this.tenantRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new common_1.NotFoundException(`租户 ${id} 不存在`);
        }
        return tenant;
    }
    async update(id, updateTenantDto) {
        const tenant = await this.findOne(id);
        if (updateTenantDto.name && updateTenantDto.name !== tenant.name) {
            const existingTenant = await this.tenantRepository.findOne({
                where: { name: updateTenantDto.name },
            });
            if (existingTenant && existingTenant.id !== id) {
                throw new common_1.ConflictException('租户名称已存在');
            }
        }
        Object.assign(tenant, updateTenantDto);
        return await this.tenantRepository.save(tenant);
    }
    async remove(id) {
        const tenant = await this.findOne(id);
        await this.tenantRepository.remove(tenant);
    }
    async activate(id) {
        const tenant = await this.findOne(id);
        tenant.status = tenant_entity_1.TenantStatus.ACTIVE;
        return await this.tenantRepository.save(tenant);
    }
    async suspend(id) {
        const tenant = await this.findOne(id);
        tenant.status = tenant_entity_1.TenantStatus.SUSPENDED;
        return await this.tenantRepository.save(tenant);
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantService);
//# sourceMappingURL=tenant.service.js.map