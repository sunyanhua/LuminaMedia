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
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const role_service_1 = require("../services/role.service");
const create_role_dto_1 = require("../dto/create-role.dto");
const update_role_dto_1 = require("../dto/update-role.dto");
const assign_permissions_dto_1 = require("../dto/assign-permissions.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const role_entity_1 = require("../../../entities/role.entity");
const permission_entity_1 = require("../../../entities/permission.entity");
let RoleController = class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    async findAll(req) {
        return this.roleService.findAll(req.user.tenantId);
    }
    async findOne(id, req) {
        return this.roleService.findOne(id, req.user.tenantId);
    }
    async create(createRoleDto, req) {
        return this.roleService.create(createRoleDto, req.user.tenantId);
    }
    async update(id, updateRoleDto, req) {
        return this.roleService.update(id, updateRoleDto, req.user.tenantId);
    }
    async remove(id, req) {
        return this.roleService.remove(id, req.user.tenantId);
    }
    async assignPermissions(id, assignPermissionsDto, req) {
        return this.roleService.assignPermissions(id, assignPermissionsDto, req.user.tenantId);
    }
    async getPermissions(id, req) {
        return this.roleService.getPermissions(id, req.user.tenantId);
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有角色' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取角色列表', type: [role_entity_1.Role] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取角色详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取角色', type: role_entity_1.Role }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '角色不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '创建新角色' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '成功创建角色', type: role_entity_1.Role }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '更新角色' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功更新角色', type: role_entity_1.Role }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '角色不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '删除角色' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '成功删除角色' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '角色不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/permissions'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '为角色分配权限' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功分配权限', type: role_entity_1.Role }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '角色或权限不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_permissions_dto_1.AssignPermissionsDto, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "assignPermissions", null);
__decorate([
    (0, common_1.Get)(':id/permissions'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取角色的权限列表' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '成功获取权限列表',
        type: [permission_entity_1.Permission],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '角色不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getPermissions", null);
exports.RoleController = RoleController = __decorate([
    (0, swagger_1.ApiTags)('roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleController);
//# sourceMappingURL=role.controller.js.map