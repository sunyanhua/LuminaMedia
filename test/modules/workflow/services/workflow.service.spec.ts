import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowService } from './workflow.service';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { WorkflowNodeRepository } from '../repositories/workflow-node.repository';
import { ApprovalRecordRepository } from '../repositories/approval-record.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowNode } from '../entities/workflow-node.entity';
import { ApprovalRecord } from '../entities/approval-record.entity';
import { Notification } from '../entities/notification.entity';
import { User } from '../../../entities/user.entity';
import { ContentDraft } from '../../../entities/content-draft.entity';
import {
  WorkflowStatus,
  ApprovalAction,
  ApprovalNodeType,
} from '../../../shared/enums/workflow-status.enum';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
import { DataSource } from 'typeorm';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let workflowRepository: jest.Mocked<WorkflowRepository>;
  let workflowNodeRepository: jest.Mocked<WorkflowNodeRepository>;
  let approvalRecordRepository: jest.Mocked<ApprovalRecordRepository>;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: getRepositoryToken(WorkflowRepository),
          useValue: mockWorkflowRepository,
        },
        {
          provide: getRepositoryToken(WorkflowNodeRepository),
          useValue: mockWorkflowNodeRepository,
        },
        {
          provide: getRepositoryToken(ApprovalRecordRepository),
          useValue: mockApprovalRecordRepository,
        },
        {
          provide: getRepositoryToken(NotificationRepository),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ContentDraft),
          useValue: mockContentDraftRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    workflowRepository = module.get(getRepositoryToken(WorkflowRepository));
    workflowNodeRepository = module.get(
      getRepositoryToken(WorkflowNodeRepository),
    );
    approvalRecordRepository = module.get(
      getRepositoryToken(ApprovalRecordRepository),
    );
    notificationRepository = module.get(
      getRepositoryToken(NotificationRepository),
    );
    eventEmitter = module.get(EventEmitter2);

    // Mock TenantContextService
    jest
      .spyOn(TenantContextService, 'getCurrentTenantIdStatic')
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
        status: WorkflowStatus.DRAFT,
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
      expect(mockWorkflowRepository.findByContentDraft).toHaveBeenCalledWith(
        createDto.contentDraftId,
      );
      expect(mockWorkflowRepository.create).toHaveBeenCalled();
      expect(mockWorkflowRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw error when content draft not found', async () => {
      const createDto = {
        contentDraftId: 'non-existent-draft',
      };

      mockContentDraftRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createWorkflow(createDto, 'user-123'),
      ).rejects.toThrow('Content draft not found');
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
      mockWorkflowRepository.findByContentDraft.mockResolvedValue(
        mockExistingWorkflow,
      );

      await expect(
        service.createWorkflow(createDto, 'user-123'),
      ).rejects.toThrow('Workflow already exists');
    });
  });

  describe('submitWorkflow', () => {
    it('should submit workflow successfully', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';

      const mockWorkflow = {
        id: workflowId,
        createdBy: userId,
        status: WorkflowStatus.DRAFT,
        title: 'Test Workflow',
        isExpedited: false,
      };

      const mockNode = {
        id: 'node-123',
        assignedTo: 'editor-123',
        status: WorkflowStatus.DRAFT,
      };

      mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
      mockWorkflowNodeRepository.findOne.mockResolvedValue(mockNode);
      mockWorkflowRepository.save.mockResolvedValue({
        ...mockWorkflow,
        status: WorkflowStatus.EDITOR_REVIEW,
      });

      const result = await service.submitWorkflow(workflowId, userId);

      expect(result.status).toBe(WorkflowStatus.EDITOR_REVIEW);
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
        status: WorkflowStatus.EDITOR_REVIEW,
      };

      mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);

      await expect(service.submitWorkflow(workflowId, userId)).rejects.toThrow(
        'Workflow cannot be submitted',
      );
    });

    it('should throw error when user is not the creator', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';

      const mockWorkflow = {
        id: workflowId,
        createdBy: 'different-user',
        status: WorkflowStatus.DRAFT,
      };

      mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);

      await expect(service.submitWorkflow(workflowId, userId)).rejects.toThrow(
        'Only the creator can submit the workflow',
      );
    });
  });

  describe('processApproval', () => {
    it('should process approval successfully', async () => {
      const workflowId = 'workflow-123';
      const nodeId = 'node-123';
      const userId = 'user-123';

      const approvalDto = {
        action: ApprovalAction.APPROVE,
        comments: 'Looks good',
      };

      const mockWorkflow = {
        id: workflowId,
        createdBy: 'creator-123',
        status: WorkflowStatus.EDITOR_REVIEW,
        title: 'Test Workflow',
        isExpedited: false,
      };

      const mockNode = {
        id: nodeId,
        workflowId,
        assignedTo: userId,
        status: WorkflowStatus.EDITOR_REVIEW,
        startedAt: new Date(Date.now() - 1000),
      };

      const mockApprovalRecord = {
        id: 'record-123',
        action: ApprovalAction.APPROVE,
      };

      mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
      mockWorkflowNodeRepository.findById.mockResolvedValue(mockNode);
      mockApprovalRecordRepository.createRecord.mockResolvedValue(
        mockApprovalRecord,
      );
      mockWorkflowNodeRepository.save.mockResolvedValue({
        ...mockNode,
        status: WorkflowStatus.COMPLETED,
      });
      mockWorkflowRepository.save.mockResolvedValue(mockWorkflow);
      mockWorkflowNodeRepository.findByWorkflowId.mockResolvedValue([mockNode]);

      const result = await service.processApproval(
        workflowId,
        nodeId,
        approvalDto,
        userId,
      );

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
        action: ApprovalAction.APPROVE,
      };

      const mockWorkflow = {
        id: workflowId,
      };

      const mockNode = {
        id: nodeId,
        workflowId,
        assignedTo: 'different-user', // Different user
        status: WorkflowStatus.EDITOR_REVIEW,
      };

      mockWorkflowRepository.findById.mockResolvedValue(mockWorkflow);
      mockWorkflowNodeRepository.findById.mockResolvedValue(mockNode);

      await expect(
        service.processApproval(workflowId, nodeId, approvalDto, userId),
      ).rejects.toThrow('User does not have permission');
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

      await expect(service.getWorkflowById(workflowId)).rejects.toThrow(
        'Workflow not found',
      );
    });
  });
});
