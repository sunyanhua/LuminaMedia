"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const workflow_controller_1 = require("./controllers/workflow.controller");
const workflow_service_1 = require("./services/workflow.service");
const notification_service_1 = require("./services/notification.service");
const workflow_repository_1 = require("./repositories/workflow.repository");
const workflow_node_repository_1 = require("./repositories/workflow-node.repository");
const approval_record_repository_1 = require("./repositories/approval-record.repository");
const notification_repository_1 = require("./repositories/notification.repository");
const workflow_entity_1 = require("./entities/workflow.entity");
const workflow_node_entity_1 = require("./entities/workflow-node.entity");
const approval_record_entity_1 = require("./entities/approval-record.entity");
const notification_entity_1 = require("./entities/notification.entity");
const user_entity_1 = require("../../entities/user.entity");
const content_draft_entity_1 = require("../../entities/content-draft.entity");
let WorkflowModule = class WorkflowModule {
};
exports.WorkflowModule = WorkflowModule;
exports.WorkflowModule = WorkflowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                workflow_entity_1.Workflow,
                workflow_node_entity_1.WorkflowNode,
                approval_record_entity_1.ApprovalRecord,
                notification_entity_1.Notification,
                user_entity_1.User,
                content_draft_entity_1.ContentDraft,
            ]),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [workflow_controller_1.WorkflowController],
        providers: [
            workflow_service_1.WorkflowService,
            notification_service_1.NotificationService,
            workflow_repository_1.WorkflowRepository,
            workflow_node_repository_1.WorkflowNodeRepository,
            approval_record_repository_1.ApprovalRecordRepository,
            notification_repository_1.NotificationRepository,
        ],
        exports: [
            workflow_service_1.WorkflowService,
            notification_service_1.NotificationService,
            workflow_repository_1.WorkflowRepository,
            workflow_node_repository_1.WorkflowNodeRepository,
            approval_record_repository_1.ApprovalRecordRepository,
            notification_repository_1.NotificationRepository,
        ],
    })
], WorkflowModule);
//# sourceMappingURL=workflow.module.js.map