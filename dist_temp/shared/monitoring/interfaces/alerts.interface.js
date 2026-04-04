"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_ALERT_RULES = exports.AlertChannelType = exports.AlertSeverity = exports.AlertRuleType = void 0;
var AlertRuleType;
(function (AlertRuleType) {
    AlertRuleType["THRESHOLD"] = "threshold";
    AlertRuleType["ANOMALY"] = "anomaly";
    AlertRuleType["ABSENCE"] = "absence";
    AlertRuleType["COMPOSITE"] = "composite";
})(AlertRuleType || (exports.AlertRuleType = AlertRuleType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["ERROR"] = "error";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertChannelType;
(function (AlertChannelType) {
    AlertChannelType["EMAIL"] = "email";
    AlertChannelType["DINGTALK"] = "dingtalk";
    AlertChannelType["WECHAT"] = "wechat";
    AlertChannelType["SLACK"] = "slack";
    AlertChannelType["SMS"] = "sms";
    AlertChannelType["WEBHOOK"] = "webhook";
    AlertChannelType["DASHBOARD"] = "dashboard";
    AlertChannelType["CONSOLE"] = "console";
})(AlertChannelType || (exports.AlertChannelType = AlertChannelType = {}));
exports.PREDEFINED_ALERT_RULES = [
    {
        id: 'high_response_time',
        name: '高响应时间告警',
        description: 'API响应时间P99超过2秒',
        type: AlertRuleType.THRESHOLD,
        conditions: [
            {
                metric: 'http_request_duration_ms',
                operator: '>',
                threshold: 2000,
                timeWindow: 300,
                aggregation: 'p99',
            },
        ],
        severity: AlertSeverity.WARNING,
        enabled: true,
        silencePeriod: 300,
    },
    {
        id: 'high_error_rate',
        name: '高错误率告警',
        description: 'API错误率超过5%',
        type: AlertRuleType.THRESHOLD,
        conditions: [
            {
                metric: 'http_errors_total',
                operator: '>',
                threshold: 0.05,
                timeWindow: 300,
                aggregation: 'rate',
            },
        ],
        severity: AlertSeverity.ERROR,
        enabled: true,
        silencePeriod: 300,
    },
    {
        id: 'low_throughput',
        name: '低吞吐量告警',
        description: '每分钟请求数低于100',
        type: AlertRuleType.THRESHOLD,
        conditions: [
            {
                metric: 'http_requests_total',
                operator: '<',
                threshold: 100,
                timeWindow: 60,
                aggregation: 'rate',
            },
        ],
        severity: AlertSeverity.INFO,
        enabled: true,
        silencePeriod: 300,
    },
    {
        id: 'database_slow_query',
        name: '数据库慢查询告警',
        description: '数据库查询耗时超过1秒',
        type: AlertRuleType.THRESHOLD,
        conditions: [
            {
                metric: 'database_query_duration_ms',
                operator: '>',
                threshold: 1000,
                timeWindow: 300,
                aggregation: 'p95',
            },
        ],
        severity: AlertSeverity.WARNING,
        enabled: true,
        silencePeriod: 300,
    },
    {
        id: 'ai_service_degradation',
        name: 'AI服务降级告警',
        description: 'AI请求成功率低于90%',
        type: AlertRuleType.THRESHOLD,
        conditions: [
            {
                metric: 'ai_requests_total',
                operator: '<',
                threshold: 0.9,
                timeWindow: 300,
                aggregation: 'success_rate',
            },
        ],
        severity: AlertSeverity.ERROR,
        enabled: true,
        silencePeriod: 300,
    },
];
//# sourceMappingURL=alerts.interface.js.map