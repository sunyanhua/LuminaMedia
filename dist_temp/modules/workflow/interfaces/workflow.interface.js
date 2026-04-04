"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEventType = void 0;
var WorkflowEventType;
(function (WorkflowEventType) {
    WorkflowEventType["WORKFLOW_CREATED"] = "WORKFLOW_CREATED";
    WorkflowEventType["WORKFLOW_STATUS_CHANGED"] = "WORKFLOW_STATUS_CHANGED";
    WorkflowEventType["NODE_ASSIGNED"] = "NODE_ASSIGNED";
    WorkflowEventType["NODE_COMPLETED"] = "NODE_COMPLETED";
    WorkflowEventType["APPROVAL_SUBMITTED"] = "APPROVAL_SUBMITTED";
    WorkflowEventType["WORKFLOW_COMPLETED"] = "WORKFLOW_COMPLETED";
    WorkflowEventType["WORKFLOW_REJECTED"] = "WORKFLOW_REJECTED";
    WorkflowEventType["WORKFLOW_ESCALATED"] = "WORKFLOW_ESCALATED";
    WorkflowEventType["NOTIFICATION_SENT"] = "NOTIFICATION_SENT";
})(WorkflowEventType || (exports.WorkflowEventType = WorkflowEventType = {}));
//# sourceMappingURL=workflow.interface.js.map