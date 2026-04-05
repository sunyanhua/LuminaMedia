"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const workflow_service_1 = require("./workflow.service");
const workflow_repository_1 = require("../repositories/workflow.repository");
const workflow_node_repository_1 = require("../repositories/workflow-node.repository");
const approval_record_repository_1 = require("../repositories/approval-record.repository");
const notification_repository_1 = require("../repositories/notification.repository");
const user_entity_1 = require("../../../entities/user.entity");
const content_draft_entity_1 = require("../../../entities/content-draft.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
const tenant_context_service_1 = require("../../../shared/services/tenant-context.service");
const typeorm_2 = require("typeorm");
describe('WorkflowService', () => {
    let service;
    let workflowRepository;
    let workflowNodeRepository;
    let approvalRecordRepository;
    let notificationRepository;
    let eventEmitter;
    const mockWorkflowRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findById: jest.fn(),
        findByContentDraft: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(),
            getMany: jest.fn(),
            getOne: jest.fn(),
            getCount: jest.fn(),
        })),
    };
    const mockWorkflowNodeRepository = {
        create: jest.fn(),
        save: jest.fn(),
        saveMany: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        findByWorkflowId: jest.fn(),
        findParallelGroupNodes: jest.fn(),
    };
    const mockApprovalRecordRepository = {
        createRecord: jest.fn(),
    };
    const mockNotificationRepository = {
        createNotification: jest.fn(),
    };
    const mockUserRepository = {
        findOne: jest.fn(),
    };
    const mockContentDraftRepository = {
        findOne: jest.fn(),
    };
    const mockDataSource = {
        createQueryRunner: jest.fn(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
        })),
    };
    const mockEventEmitter = {
        emit: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                workflow_service_1.WorkflowService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(workflow_repository_1.WorkflowRepository),
                    useValue: mockWorkflowRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(workflow_node_repository_1.WorkflowNodeRepository),
                    useValue: mockWorkflowNodeRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(approval_record_repository_1.ApprovalRecordRepository),
                    useValue: mockApprovalRecordRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(notification_repository_1.NotificationRepository),
                    useValue: mockNotificationRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(content_draft_entity_1.ContentDraft),
                    useValue: mockContentDraftRepository,
                },
                {
                    provide: event_emitter_1.EventEmitter2,
                    useValue: mockEventEmitter,
                },
                {
                    provide: typeorm_2.DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();
        service = module.get(workflow_service_1.WorkflowService);
        workflowRepository = module.get((0, typeorm_1.getRepositoryToken)(workflow_repository_1.WorkflowRepository));
        workflowNodeRepository = module.get((0, typeorm_1.getRepositoryToken)(workflow_node_repository_1.WorkflowNodeRepository));
        approvalRecordRepository = module.get((0, typeorm_1.getRepositoryToken)(approval_record_repository_1.ApprovalRecordRepository));
        notificationRepository = module.get((0, typeorm_1.getRepositoryToken)(notification_repository_1.NotificationRepository));
        eventEmitter = module.get(event_emitter_1.EventEmitter2);
        jest
            .spyOn(tenant_context_service_1.TenantContextService, 'getCurrentTenantIdStatic')
            .mockReturnValue('test-tenant');
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('createWorkflow', () => {
        it('should create a workflow successfully', async () => {
            const createDto = {
                contentDraftId: 'draft-123',
                title: 'Test Workflow',
                priority: 3,
            };
            const mockContentDraft = {
                id: 'draft-123',
                title: 'Test Draft',
            };
            const mockWorkflow = {
                id: 'workflow-123',
                ...createDto,
                createdBy: 'user-123',
                status: workflow_status_enum_1.WorkflowStatus.DRAFT,
            };
            mockContentDraftRepository.findOne.mockResolvedValue(mockContentDraft);
            mockWorkflowRepository.findByContentDraft.mockResolvedValue(null);
            mockWorkflowRepository.create.mockReturnValue(mockWorkflow);
            mockWorkflowRepository.save.mockResolvedValue(mockWorkflow);
            mockWorkflowNodeRepository.saveMany.mockResolvedValue([]);
            const result = await service.createWorkflow(createDto, 'user-123');
            expect(result).toEqual(mockWorkflow);
            expect(mockContentDraftRepository.findOne).toHaveBeenCalledWith({
                where: { id: createDto.contentDraftId },
            });
            expect(mockWorkflowRepository.findByContentDraft).toHaveBeenCalledWith(createDto.contentDraftId);
            expect(mockWorkflowRepository.create).toHaveBeenCalled();
            expect(mockWorkflowRepository.save).toHaveBeenCalled();
            expect(eventEmitter.emit).toHaveBeenCalled();
        });
        it('should throw error when content draft not found', async () => {
            const createDto = {
                contentDraftId: 'non-existent-draft',
            };
            mockContentDraftRepository.findOne.mockResolvedValue(null);
            await expect(service.createWorkflow(createDto, 'user-123')).rejects.toThrow('Content draft not found');
        });
        it('should throw error when workflow already exists for draft', async () => {
            const createDto = {
                contentDraftId: 'draft-123',
            };
            const mockContentDraft = {
                id: 'draft-123',
            };
            const mockExistingWorkflow = {
                id: 'existing-workflow',
            };
            mockContentDraftRepository.findOne.mockResolvedValue(mockContentDraft);
            mockWorkflowRepository.findByContentDraft.mockResolvedValue(mockExistingWorkflow);
            await expect(service.createWorkflow(createDto, 'user-123')).rejects.toThrow('Workflow already exists');
        });
    });
    describe('submitWorkflow', () => {
        it('should submit workflow successfully', async () => {
            const workflowId = 'workflow-123';
            const userId = 'user-123';
            const mockWorkflow = {
                id: workflowId,
                createdBy: userId,
                status: workflow_status_enum_1.WorkflowStatus.DRAFT,
                title: 'Test Workflow',
                isExpedited: false,
            };
            const mockNode = {
                id: 'node-123',
                assignedTo: 'editor-123',
                status: workflow_status_enum_1.WorkflowStatus.DRAFT,
            };
            mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
            mockWorkflowNodeRepository.findOne.mockResolvedValue(mockNode);
            mockWorkflowRepository.save.mockResolvedValue({
                ...mockWorkflow,
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            });
            const result = await service.submitWorkflow(workflowId, userId);
            expect(result.status).toBe(workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW);
            expect(mockWorkflowRepository.findById).toHaveBeenCalledWith(workflowId);
            expect(mockWorkflowNodeRepository.findOne).toHaveBeenCalled();
            expect(mockWorkflowNodeRepository.save).toHaveBeenCalled();
            expect(eventEmitter.emit).toHaveBeenCalled();
        });
        it('should throw error when workflow not in draft status', async () => {
            const workflowId = 'workflow-123';
            const userId = 'user-123';
            const mockWorkflow = {
                id: workflowId,
                createdBy: userId,
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            };
            mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
            await expect(service.submitWorkflow(workflowId, userId)).rejects.toThrow('Workflow cannot be submitted');
        });
        it('should throw error when user is not the creator', async () => {
            const workflowId = 'workflow-123';
            const userId = 'user-123';
            const mockWorkflow = {
                id: workflowId,
                createdBy: 'different-user',
                status: workflow_status_enum_1.WorkflowStatus.DRAFT,
            };
            mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
            await expect(service.submitWorkflow(workflowId, userId)).rejects.toThrow('Only the creator can submit the workflow');
        });
    });
    describe('processApproval', () => {
        it('should process approval successfully', async () => {
            const workflowId = 'workflow-123';
            const nodeId = 'node-123';
            const userId = 'user-123';
            const approvalDto = {
                action: workflow_status_enum_1.ApprovalAction.APPROVE,
                comments: 'Looks good',
            };
            const mockWorkflow = {
                id: workflowId,
                createdBy: 'creator-123',
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
                title: 'Test Workflow',
                isExpedited: false,
            };
            const mockNode = {
                id: nodeId,
                workflowId,
                assignedTo: userId,
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
                startedAt: new Date(Date.now() - 1000),
            };
            const mockApprovalRecord = {
                id: 'record-123',
                action: workflow_status_enum_1.ApprovalAction.APPROVE,
            };
            mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
            mockWorkflowNodeRepository.findById.mockResolvedValue(mockNode);
            mockApprovalRecordRepository.createRecord.mockResolvedValue(mockApprovalRecord);
            mockWorkflowNodeRepository.save.mockResolvedValue({
                ...mockNode,
                status: workflow_status_enum_1.WorkflowStatus.COMPLETED,
            });
            mockWorkflowRepository.save.mockResolvedValue(mockWorkflow);
            mockWorkflowNodeRepository.findByWorkflowId.mockResolvedValue([mockNode]);
            const result = await service.processApproval(workflowId, nodeId, approvalDto, userId);
            expect(result.workflow).toBeDefined();
            expect(result.node).toBeDefined();
            expect(result.record).toBe(mockApprovalRecord);
            expect(mockWorkflowRepository.findById).toHaveBeenCalledWith(workflowId);
            expect(mockWorkflowNodeRepository.findById).toHaveBeenCalledWith(nodeId);
            expect(mockApprovalRecordRepository.createRecord).toHaveBeenCalled();
            expect(eventEmitter.emit).toHaveBeenCalled();
        });
        it('should throw error when user does not have permission', async () => {
            const workflowId = 'workflow-123';
            const nodeId = 'node-123';
            const userId = 'user-123';
            const approvalDto = {
                action: workflow_status_enum_1.ApprovalAction.APPROVE,
            };
            const mockWorkflow = {
                id: workflowId,
            };
            const mockNode = {
                id: nodeId,
                workflowId,
                assignedTo: 'different-user',
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            };
            mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
            mockWorkflowNodeRepository.findById.mockResolvedValue(mockNode);
            await expect(service.processApproval(workflowId, nodeId, approvalDto, userId)).rejects.toThrow('User does not have permission');
        });
    });
    describe('getWorkflowById', () => {
        it('should return workflow when found', async () => {
            const workflowId = 'workflow-123';
            const mockWorkflow = { id: workflowId, title: 'Test Workflow' };
            mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
            const result = await service.getWorkflowById(workflowId);
            expect(result).toEqual(mockWorkflow);
            expect(mockWorkflowRepository.findById).toHaveBeenCalledWith(workflowId);
        });
        it('should throw error when workflow not found', async () => {
            const workflowId = 'non-existent-workflow';
            mockWorkflowRepository.findById.mockResolvedValue(null);
            await expect(service.getWorkflowById(workflowId)).rejects.toThrow('Workflow not found');
        });
    });
});
//# sourceMappingURL=workflow.service.spec.js.map