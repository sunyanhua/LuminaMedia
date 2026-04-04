"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_REPORTS = exports.ReportFormat = exports.ReportStatus = exports.ReportType = void 0;
var ReportType;
(function (ReportType) {
    ReportType["DAILY"] = "daily";
    ReportType["WEEKLY"] = "weekly";
    ReportType["MONTHLY"] = "monthly";
    ReportType["PERFORMANCE"] = "performance";
    ReportType["SECURITY"] = "security";
    ReportType["BUSINESS"] = "business";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "pending";
    ReportStatus["GENERATING"] = "generating";
    ReportStatus["COMPLETED"] = "completed";
    ReportStatus["FAILED"] = "failed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["HTML"] = "html";
    ReportFormat["PDF"] = "pdf";
    ReportFormat["JSON"] = "json";
    ReportFormat["CSV"] = "csv";
    ReportFormat["MARKDOWN"] = "markdown";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
exports.PREDEFINED_REPORTS = [
    {
        id: 'daily_performance',
        name: '每日性能报告',
        type: ReportType.DAILY,
        description: '每日系统性能指标报告',
        schedule: '0 0 * * *',
        format: [ReportFormat.HTML, ReportFormat.PDF],
        recipients: ['devops@example.com'],
        enabled: true,
        retentionDays: 30,
    },
    {
        id: 'weekly_business',
        name: '每周业务报告',
        type: ReportType.WEEKLY,
        description: '每周业务指标和用户活动报告',
        schedule: '0 0 * * 1',
        format: [ReportFormat.HTML, ReportFormat.PDF],
        recipients: ['management@example.com', 'product@example.com'],
        enabled: true,
        retentionDays: 90,
    },
    {
        id: 'monthly_summary',
        name: '月度总结报告',
        type: ReportType.MONTHLY,
        description: '月度系统性能和业务总结报告',
        schedule: '0 0 1 * *',
        format: [ReportFormat.HTML, ReportFormat.PDF, ReportFormat.JSON],
        recipients: ['executive@example.com', 'devops@example.com'],
        enabled: true,
        retentionDays: 365,
    },
    {
        id: 'performance_health',
        name: '性能健康报告',
        type: ReportType.PERFORMANCE,
        description: '系统性能健康度评估报告',
        schedule: '0 */6 * * *',
        format: [ReportFormat.HTML],
        recipients: ['devops@example.com'],
        enabled: true,
        retentionDays: 7,
    },
];
//# sourceMappingURL=reports.interface.js.map