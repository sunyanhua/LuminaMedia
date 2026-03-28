import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowService } from './services/workflow.service';
import { NotificationService } from './services/notification.service';
import { WorkflowRepository } from './repositories/workflow.repository';
import { WorkflowNodeRepository } from './repositories/workflow-node.repository';
import { ApprovalRecordRepository } from './repositories/approval-record.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { Workflow } from './entities/workflow.entity';
import { WorkflowNode } from './entities/workflow-node.entity';
import { ApprovalRecord } from './entities/approval-record.entity';
import { Notification } from './entities/notification.entity';
import { User } from '../../entities/user.entity';
import { ContentDraft } from '../../entities/content-draft.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workflow,
      WorkflowNode,
      ApprovalRecord,
      Notification,
      User,
      ContentDraft,
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    NotificationService,
    WorkflowRepository,
    WorkflowNodeRepository,
    ApprovalRecordRepository,
    NotificationRepository,
  ],
  exports: [
    WorkflowService,
    NotificationService,
    WorkflowRepository,
    WorkflowNodeRepository,
    ApprovalRecordRepository,
    NotificationRepository,
  ],
})
export class WorkflowModule {}
