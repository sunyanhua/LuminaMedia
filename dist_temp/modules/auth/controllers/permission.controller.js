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
exports.PermissionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permission_service_1 = require("../services/permission.service");
const create_permission_dto_1 = require("../dto/create-permission.dto");
const update_permission_dto_1 = require("../dto/update-permission.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const permission_entity_1 = require("../../../entities/permission.entity");
let PermissionController = class PermissionController {
    permissionService;
    constructor(permissionService) {
        this.permissionService = permissionService;
    }
    async findAll(req) {
        return this.permissionService.findAll(req.user.tenantId);
    }
    async findByModule(module, req) {
        return this.permissionService.findByModule(module, req.user.tenantId);
    }
    async findOne(id, req) {
        return this.permissionService.findOne(id, req.user.tenantId);
    }
    async create(createPermissionDto, req) {
        return this.permissionService.create(createPermissionDto, req.user.tenantId);
    }
    async update(id, updatePermissionDto, req) {
        return this.permissionService.update(id, updatePermissionDto, req.user.tenantId);
    }
    async remove(id, req) {
        return this.permissionService.remove(id, req.user.tenantId);
    }
};
exports.PermissionController = PermissionController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有权限' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '成功获取权限列表',
        type: [permission_entity_1.Permission],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('module/:module'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '按模块获取权限' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '成功获取权限列表',
        type: [permission_entity_1.Permission],
    }),
    __param(0, (0, common_1.Param)('module')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findByModule", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取权限详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取权限', type: permission_entity_1.Permission }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '权限不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '创建新权限' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '成功创建权限', type: permission_entity_1.Permission }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_permission_dto_1.CreatePermissionDto, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '更新权限' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功更新权限', type: permission_entity_1.Permission }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '权限不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_permission_dto_1.UpdatePermissionDto, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '删除权限' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '成功删除权限' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '权限不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "remove", null);
exports.PermissionController = PermissionController = __decorate([
    (0, swagger_1.ApiTags)('permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], PermissionController);
//# sourceMappingURL=permission.controller.js.map