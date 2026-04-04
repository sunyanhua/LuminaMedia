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
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflow_service_1 = require("../services/workflow.service");
const notification_service_1 = require("../services/notification.service");
const create_workflow_dto_1 = require("../dto/create-workflow.dto");
const update_workflow_dto_1 = require("../dto/update-workflow.dto");
const approval_request_dto_1 = require("../dto/approval-request.dto");
const workflow_filter_dto_1 = require("../dto/workflow-filter.dto");
const workflow_entity_1 = require("../entities/workflow.entity");
const workflow_node_entity_1 = require("../entities/workflow-node.entity");
const approval_record_entity_1 = require("../entities/approval-record.entity");
const notification_entity_1 = require("../entities/notification.entity");
const jwt_auth_guard_1 = require("../../../modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../modules/auth/guards/roles.guard");
const user_role_enum_1 = require("../../../shared/enums/user-role.enum");
let WorkflowController = class WorkflowController {
    workflowService;
    notificationService;
    constructor(workflowService, notificationService) {
        this.workflowService = workflowService;
        this.notificationService = notificationService;
    }
    async createWorkflow(createDto, req) {
        return this.workflowService.createWorkflow(createDto, req.user.id);
    }
    async submitWorkflow(workflowId, req) {
        return this.workflowService.submitWorkflow(workflowId, req.user.id);
    }
    async approveNode(workflowId, nodeId, approvalDto, req) {
        return this.workflowService.processApproval(workflowId, nodeId, approvalDto, req.user.id);
    }
    async findWorkflows(filter) {
        const { page = 1, limit = 20, ...restFilter } = filter;
        return this.workflowService.findWorkflows(restFilter, page, limit);
    }
    async getWorkflowStats() {
        return this.workflowService.getWorkflowStats();
    }
    async getWorkflow(workflowId) {
        return this.workflowService.getWorkflowById(workflowId);
    }
    async getWorkflowNodes(workflowId) {
        return this.workflowService.getWorkflowNodes(workflowId);
    }
    async getApprovalRecords(workflowId) {
        return this.workflowService.getApprovalRecords(workflowId);
    }
    async updateWorkflow(workflowId, updateDto, req) {
        const workflow = await this.workflowService.getWorkflowById(workflowId);
        if (workflow.createdBy !== req.user.id &&
            !req.user.roles.includes(user_role_enum_1.UserRole.ADMIN)) {
            throw new Error('没有权限更新此工作流');
        }
        return workflow;
    }
    async withdrawWorkflow(workflowId, req) {
        return this.workflowService.withdrawWorkflow(workflowId, req.user.id);
    }
    async getMyPendingWorkflows(req) {
        return [];
    }
    async getUnreadNotifications(req) {
        return this.notificationService.getUserUnreadNotifications(req.user.id);
    }
    async markNotificationAsRead(notificationId, req) {
        return this.notificationService.markNotificationAsRead(notificationId, req.user.id);
    }
    async markNotificationAsActioned(notificationId, req) {
        return this.notificationService.markNotificationAsActioned(notificationId, req.user.id);
    }
    async deleteNotification(notificationId, req) {
        return this.notificationService.deleteUserNotification(notificationId, req.user.id);
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '创建工作流',
        description: '为内容草稿创建三审三校工作流',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '工作流创建成功', type: workflow_entity_1.Workflow }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '内容草稿不存在' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workflow_dto_1.CreateWorkflowDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "createWorkflow", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, swagger_1.ApiOperation)({
        summary: '提交工作流审批',
        description: '将工作流从草稿状态提交开始审批流程',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工作流ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '提交成功', type: workflow_entity_1.Workflow }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '工作流状态不符合提交条件' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '没有权限提交' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "submitWorkflow", null);
__decorate([
    (0, common_1.Post)(':workflowId/nodes/:nodeId/approve'),
    (0, swagger_1.ApiOperation)({
        summary: '审批节点',
        description: '对工作流节点进行审批操作',
    }),
    (0, swagger_1.ApiParam)({ name: 'workflowId', description: '工作流ID' }),
    (0, swagger_1.ApiParam)({ name: 'nodeId', description: '节点ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '审批成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '审批请求错误' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '没有审批权限' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '工作流或节点不存在' }),
    __param(0, (0, common_1.Param)('workflowId')),
    __param(1, (0, common_1.Param)('nodeId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, approval_request_dto_1.ApprovalRequestDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "approveNode", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '查询工作流列表',
        description: '根据条件查询工作流，支持分页和过滤',
    }),
    (0, swagger_1.ApiQuery)({ type: workflow_filter_dto_1.WorkflowFilterDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '查询成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [workflow_filter_dto_1.WorkflowFilterDto]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findWorkflows", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取工作流统计',
        description: '获取工作流的状态统计信息',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '统计信息', type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflowStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取工作流详情',
        description: '根据ID获取工作流详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工作流ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '工作流详情', type: workflow_entity_1.Workflow }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '工作流不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflow", null);
__decorate([
    (0, common_1.Get)(':id/nodes'),
    (0, swagger_1.ApiOperation)({
        summary: '获取工作流节点',
        description: '获取工作流的所有节点',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工作流ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '节点列表', type: [workflow_node_entity_1.WorkflowNode] }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflowNodes", null);
__decorate([
    (0, common_1.Get)(':id/approvals'),
    (0, swagger_1.ApiOperation)({
        summary: '获取审批记录',
        description: '获取工作流的所有审批记录',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工作流ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '审批记录列表',
        type: [approval_record_entity_1.ApprovalRecord],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getApprovalRecords", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新工作流', description: '更新工作流信息' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工作流ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功', type: workflow_entity_1.Workflow }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '更新请求错误' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '没有更新权限' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '工作流不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_workflow_dto_1.UpdateWorkflowDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "updateWorkflow", null);
__decorate([
    (0, common_1.Delete)(':id/withdraw'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '撤回工作流', description: '撤回已提交的工作流' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '工作流ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '撤回成功', type: workflow_entity_1.Workflow }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '工作流状态不符合撤回条件' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '没有撤回权限' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "withdrawWorkflow", null);
__decorate([
    (0, common_1.Get)('my/pending'),
    (0, swagger_1.ApiOperation)({
        summary: '获取我的待办任务',
        description: '获取当前用户需要审批的工作流节点',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '待办任务列表', type: [workflow_entity_1.Workflow] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getMyPendingWorkflows", null);
__decorate([
    (0, common_1.Get)('notifications/unread'),
    (0, swagger_1.ApiOperation)({
        summary: '获取未读通知',
        description: '获取当前用户的未读通知',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '未读通知列表',
        type: [notification_entity_1.Notification],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getUnreadNotifications", null);
__decorate([
    (0, common_1.Put)('notifications/:id/read'),
    (0, swagger_1.ApiOperation)({
        summary: '标记通知为已读',
        description: '将通知标记为已读状态',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '通知ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '标记成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '没有权限标记此通知' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Put)('notifications/:id/actioned'),
    (0, swagger_1.ApiOperation)({
        summary: '标记通知为已处理',
        description: '将通知标记为已处理状态',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '通知ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '标记成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '没有权限标记此通知' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "markNotificationAsActioned", null);
__decorate([
    (0, common_1.Delete)('notifications/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: '删除通知', description: '删除用户的通知' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '通知ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '没有权限删除此通知' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "deleteNotification", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, swagger_1.ApiTags)('工作流管理'),
    (0, common_1.Controller)('workflows'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService,
        notification_service_1.NotificationService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map