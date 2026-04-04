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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../../../entities/role.entity");
const permission_entity_1 = require("../../../entities/permission.entity");
let RoleService = class RoleService {
    roleRepository;
    permissionRepository;
    constructor(roleRepository, permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }
    async findAll(tenantId) {
        return this.roleRepository.find({
            where: { tenantId },
            relations: ['permissions'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, tenantId) {
        const role = await this.roleRepository.findOne({
            where: { id, tenantId },
            relations: ['permissions'],
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async create(createRoleDto, tenantId) {
        const role = this.roleRepository.create({
            ...createRoleDto,
            tenantId,
        });
        return this.roleRepository.save(role);
    }
    async update(id, updateRoleDto, tenantId) {
        const role = await this.findOne(id, tenantId);
        Object.assign(role, updateRoleDto);
        return this.roleRepository.save(role);
    }
    async remove(id, tenantId) {
        const role = await this.findOne(id, tenantId);
        await this.roleRepository.remove(role);
    }
    async assignPermissions(id, assignPermissionsDto, tenantId) {
        const role = await this.findOne(id, tenantId);
        const permissions = await this.permissionRepository.find({
            where: {
                id: (0, typeorm_2.In)(assignPermissionsDto.permissionIds),
                tenantId,
            },
        });
        if (permissions.length !== assignPermissionsDto.permissionIds.length) {
            throw new common_1.NotFoundException('Some permissions not found');
        }
        role.permissions = permissions;
        return this.roleRepository.save(role);
    }
    async getPermissions(id, tenantId) {
        const role = await this.roleRepository.findOne({
            where: { id, tenantId },
            relations: ['permissions'],
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role.permissions;
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RoleService);
//# sourceMappingURL=role.service.js.map