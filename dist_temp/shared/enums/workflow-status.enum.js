"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.ApprovalAction = exports.ApprovalNodeType = exports.WorkflowStatus = void 0;
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["DRAFT"] = "DRAFT";
    WorkflowStatus["EDITOR_REVIEW"] = "EDITOR_REVIEW";
    WorkflowStatus["AI_CHECK"] = "AI_CHECK";
    WorkflowStatus["MANAGER_REVIEW"] = "MANAGER_REVIEW";
    WorkflowStatus["LEGAL_REVIEW"] = "LEGAL_REVIEW";
    WorkflowStatus["APPROVED"] = "APPROVED";
    WorkflowStatus["PUBLISHED"] = "PUBLISHED";
    WorkflowStatus["COMPLETED"] = "COMPLETED";
    WorkflowStatus["REJECTED"] = "REJECTED";
    WorkflowStatus["NEEDS_REVISION"] = "NEEDS_REVISION";
    WorkflowStatus["WITHDRAWN"] = "WITHDRAWN";
    WorkflowStatus["CANCELLED"] = "CANCELLED";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
var ApprovalNodeType;
(function (ApprovalNodeType) {
    ApprovalNodeType["EDITOR"] = "EDITOR";
    ApprovalNodeType["AI"] = "AI";
    ApprovalNodeType["MANAGER"] = "MANAGER";
    ApprovalNodeType["LEGAL"] = "LEGAL";
    ApprovalNodeType["PARALLEL"] = "PARALLEL";
    ApprovalNodeType["SEQUENTIAL"] = "SEQUENTIAL";
})(ApprovalNodeType || (exports.ApprovalNodeType = ApprovalNodeType = {}));
var ApprovalAction;
(function (ApprovalAction) {
    ApprovalAction["APPROVE"] = "APPROVE";
    ApprovalAction["REJECT"] = "REJECT";
    ApprovalAction["RETURN_FOR_REVISION"] = "RETURN_FOR_REVISION";
    ApprovalAction["TRANSFER"] = "TRANSFER";
    ApprovalAction["EXPEDITE"] = "EXPEDITE";
})(ApprovalAction || (exports.ApprovalAction = ApprovalAction = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TASK_ASSIGNED"] = "TASK_ASSIGNED";
    NotificationType["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    NotificationType["APPROVAL_COMPLETED"] = "APPROVAL_COMPLETED";
    NotificationType["APPROVAL_TIMEOUT"] = "APPROVAL_TIMEOUT";
    NotificationType["WORKFLOW_STATUS_CHANGED"] = "WORKFLOW_STATUS_CHANGED";
    NotificationType["URGENT_APPROVAL"] = "URGENT_APPROVAL";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=workflow-status.enum.js.map