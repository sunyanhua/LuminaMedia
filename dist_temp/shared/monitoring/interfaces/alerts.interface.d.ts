export declare enum AlertRuleType {
    THRESHOLD = "threshold",
    ANOMALY = "anomaly",
    ABSENCE = "absence",
    COMPOSITE = "composite"
}
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export interface AlertCondition {
    metric: string;
    operator: string;
    threshold: number;
    timeWindow?: number;
    aggregation?: string;
}
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    type: AlertRuleType;
    conditions: AlertCondition[];
    severity: AlertSeverity;
    enabled: boolean;
    silencePeriod?: number;
    lastTriggeredAt?: Date;
    triggerCount?: number;
}
export interface AlertInstance {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    triggeredAt: Date;
    metricValue: number;
    threshold: number;
    recoveredAt?: Date;
    recovered: boolean;
    extraData?: Record<string, any>;
}
export declare enum AlertChannelType {
    EMAIL = "email",
    DINGTALK = "dingtalk",
    WECHAT = "wechat",
    SLACK = "slack",
    SMS = "sms",
    WEBHOOK = "webhook",
    DASHBOARD = "dashboard",
    CONSOLE = "console"
}
export interface AlertChannel {
    id: string;
    type: AlertChannelType;
    name: string;
    config: Record<string, any>;
    enabled: boolean;
}
export interface AlertNotification {
    id: string;
    alertId: string;
    channelId: string;
    sentAt: Date;
    status: 'pending' | 'sent' | 'failed';
    errorMessage?: string;
}
export declare const PREDEFINED_ALERT_RULES: AlertRule[];
