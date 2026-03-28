import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkflowService } from '../services/workflow.service';
import { NotificationService } from '../services/notification.service';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';
import { UpdateWorkflowDto } from '../dto/update-workflow.dto';
import { ApprovalRequestDto } from '../dto/approval-request.dto';
import { WorkflowFilterDto } from '../dto/workflow-filter.dto';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowNode } from '../entities/workflow-node.entity';
import { ApprovalRecord } from '../entities/approval-record.entity';
import { Notification } from '../entities/notification.entity';
import { WorkflowStats } from '../interfaces/workflow.interface';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../modules/auth/guards/roles.guard';
import { Roles } from '../../../modules/auth/decorators/roles.decorator';
import { UserRole } from '../../../shared/enums/user-role.enum';

@ApiTags('工作流管理')
@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '创建工作流',
    description: '为内容草稿创建三审三校工作流',
  })
  @ApiResponse({ status: 201, description: '工作流创建成功', type: Workflow })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '内容草稿不存在' })
  async createWorkflow(
    @Body() createDto: CreateWorkflowDto,
    @Request() req,
  ): Promise<Workflow> {
    return this.workflowService.createWorkflow(createDto, req.user.id);
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: '提交工作流审批',
    description: '将工作流从草稿状态提交开始审批流程',
  })
  @ApiParam({ name: 'id', description: '工作流ID' })
  @ApiResponse({ status: 200, description: '提交成功', type: Workflow })
  @ApiResponse({ status: 400, description: '工作流状态不符合提交条件' })
  @ApiResponse({ status: 403, description: '没有权限提交' })
  async submitWorkflow(
    @Param('id') workflowId: string,
    @Request() req,
  ): Promise<Workflow> {
    return this.workflowService.submitWorkflow(workflowId, req.user.id);
  }

  @Post(':workflowId/nodes/:nodeId/approve')
  @ApiOperation({
    summary: '审批节点',
    description: '对工作流节点进行审批操作',
  })
  @ApiParam({ name: 'workflowId', description: '工作流ID' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiResponse({ status: 200, description: '审批成功' })
  @ApiResponse({ status: 400, description: '审批请求错误' })
  @ApiResponse({ status: 403, description: '没有审批权限' })
  @ApiResponse({ status: 404, description: '工作流或节点不存在' })
  async approveNode(
    @Param('workflowId') workflowId: string,
    @Param('nodeId') nodeId: string,
    @Body() approvalDto: ApprovalRequestDto,
    @Request() req,
  ): Promise<{
    workflow: Workflow;
    node: WorkflowNode;
    record: ApprovalRecord;
  }> {
    return this.workflowService.processApproval(
      workflowId,
      nodeId,
      approvalDto,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: '查询工作流列表',
    description: '根据条件查询工作流，支持分页和过滤',
  })
  @ApiQuery({ type: WorkflowFilterDto })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findWorkflows(
    @Query() filter: WorkflowFilterDto,
  ): Promise<{ data: Workflow[]; total: number }> {
    const { page = 1, limit = 20, ...restFilter } = filter;
    return this.workflowService.findWorkflows(restFilter, page, limit);
  }

  @Get('stats')
  @ApiOperation({
    summary: '获取工作流统计',
    description: '获取工作流的状态统计信息',
  })
  @ApiResponse({ status: 200, description: '统计信息', type: Object })
  async getWorkflowStats(): Promise<WorkflowStats> {
    return this.workflowService.getWorkflowStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取工作流详情',
    description: '根据ID获取工作流详细信息',
  })
  @ApiParam({ name: 'id', description: '工作流ID' })
  @ApiResponse({ status: 200, description: '工作流详情', type: Workflow })
  @ApiResponse({ status: 404, description: '工作流不存在' })
  async getWorkflow(@Param('id') workflowId: string): Promise<Workflow> {
    return this.workflowService.getWorkflowById(workflowId);
  }

  @Get(':id/nodes')
  @ApiOperation({
    summary: '获取工作流节点',
    description: '获取工作流的所有节点',
  })
  @ApiParam({ name: 'id', description: '工作流ID' })
  @ApiResponse({ status: 200, description: '节点列表', type: [WorkflowNode] })
  async getWorkflowNodes(
    @Param('id') workflowId: string,
  ): Promise<WorkflowNode[]> {
    return this.workflowService.getWorkflowNodes(workflowId);
  }

  @Get(':id/approvals')
  @ApiOperation({
    summary: '获取审批记录',
    description: '获取工作流的所有审批记录',
  })
  @ApiParam({ name: 'id', description: '工作流ID' })
  @ApiResponse({
    status: 200,
    description: '审批记录列表',
    type: [ApprovalRecord],
  })
  async getApprovalRecords(
    @Param('id') workflowId: string,
  ): Promise<ApprovalRecord[]> {
    return this.workflowService.getApprovalRecords(workflowId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新工作流', description: '更新工作流信息' })
  @ApiParam({ name: 'id', description: '工作流ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Workflow })
  @ApiResponse({ status: 400, description: '更新请求错误' })
  @ApiResponse({ status: 403, description: '没有更新权限' })
  @ApiResponse({ status: 404, description: '工作流不存在' })
  async updateWorkflow(
    @Param('id') workflowId: string,
    @Body() updateDto: UpdateWorkflowDto,
    @Request() req,
  ): Promise<Workflow> {
    // 这里应该添加权限检查，只有创建者或管理员可以更新
    const workflow = await this.workflowService.getWorkflowById(workflowId);
    if (
      workflow.createdBy !== req.user.id &&
      !req.user.roles.includes(UserRole.ADMIN)
    ) {
      throw new Error('没有权限更新此工作流');
    }

    // 实际更新逻辑应该在service中实现
    // 这里简化处理，直接返回工作流
    return workflow;
  }

  @Delete(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '撤回工作流', description: '撤回已提交的工作流' })
  @ApiParam({ name: 'id', description: '工作流ID' })
  @ApiResponse({ status: 200, description: '撤回成功', type: Workflow })
  @ApiResponse({ status: 400, description: '工作流状态不符合撤回条件' })
  @ApiResponse({ status: 403, description: '没有撤回权限' })
  async withdrawWorkflow(
    @Param('id') workflowId: string,
    @Request() req,
  ): Promise<Workflow> {
    return this.workflowService.withdrawWorkflow(workflowId, req.user.id);
  }

  @Get('my/pending')
  @ApiOperation({
    summary: '获取我的待办任务',
    description: '获取当前用户需要审批的工作流节点',
  })
  @ApiResponse({ status: 200, description: '待办任务列表', type: [Workflow] })
  async getMyPendingWorkflows(@Request() req): Promise<Workflow[]> {
    // 这里调用repository方法获取当前用户的待办任务
    // 简化实现，实际应该调用service方法
    return [];
  }

  @Get('notifications/unread')
  @ApiOperation({
    summary: '获取未读通知',
    description: '获取当前用户的未读通知',
  })
  @ApiResponse({
    status: 200,
    description: '未读通知列表',
    type: [Notification],
  })
  async getUnreadNotifications(@Request() req): Promise<Notification[]> {
    return this.notificationService.getUserUnreadNotifications(req.user.id);
  }

  @Put('notifications/:id/read')
  @ApiOperation({
    summary: '标记通知为已读',
    description: '将通知标记为已读状态',
  })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: 200, description: '标记成功' })
  @ApiResponse({ status: 403, description: '没有权限标记此通知' })
  async markNotificationAsRead(
    @Param('id') notificationId: string,
    @Request() req,
  ): Promise<void> {
    return this.notificationService.markNotificationAsRead(
      notificationId,
      req.user.id,
    );
  }

  @Put('notifications/:id/actioned')
  @ApiOperation({
    summary: '标记通知为已处理',
    description: '将通知标记为已处理状态',
  })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: 200, description: '标记成功' })
  @ApiResponse({ status: 403, description: '没有权限标记此通知' })
  async markNotificationAsActioned(
    @Param('id') notificationId: string,
    @Request() req,
  ): Promise<void> {
    return this.notificationService.markNotificationAsActioned(
      notificationId,
      req.user.id,
    );
  }

  @Delete('notifications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除通知', description: '删除用户的通知' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 403, description: '没有权限删除此通知' })
  async deleteNotification(
    @Param('id') notificationId: string,
    @Request() req,
  ): Promise<void> {
    return this.notificationService.deleteUserNotification(
      notificationId,
      req.user.id,
    );
  }
}
