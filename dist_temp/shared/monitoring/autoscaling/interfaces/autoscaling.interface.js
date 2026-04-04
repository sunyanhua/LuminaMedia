"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_SCALING_RULES = exports.PREDEFINED_SCALING_METRICS = exports.ScalingEventType = exports.ScalingMetricType = void 0;
var ScalingMetricType;
(function (ScalingMetricType) {
    ScalingMetricType["RESOURCE"] = "resource";
    ScalingMetricType["POD"] = "pod";
    ScalingMetricType["OBJECT"] = "object";
    ScalingMetricType["BUSINESS"] = "business";
})(ScalingMetricType || (exports.ScalingMetricType = ScalingMetricType = {}));
var ScalingEventType;
(function (ScalingEventType) {
    ScalingEventType["SCALE_UP"] = "scale_up";
    ScalingEventType["SCALE_DOWN"] = "scale_down";
    ScalingEventType["NO_SCALE"] = "no_scale";
    ScalingEventType["ERROR"] = "error";
})(ScalingEventType || (exports.ScalingEventType = ScalingEventType = {}));
exports.PREDEFINED_SCALING_METRICS = [
    {
        name: 'cpu_utilization',
        type: ScalingMetricType.RESOURCE,
        description: 'CPU利用率',
        targetType: 'Utilization',
        targetValue: 70,
        source: {
            type: 'resource',
            resourceName: 'cpu',
        },
    },
    {
        name: 'memory_utilization',
        type: ScalingMetricType.RESOURCE,
        description: '内存利用率',
        targetType: 'Utilization',
        targetValue: 80,
        source: {
            type: 'resource',
            resourceName: 'memory',
        },
    },
    {
        name: 'http_requests_per_second',
        type: ScalingMetricType.POD,
        description: '每秒HTTP请求数',
        targetType: 'AverageValue',
        targetValue: 100,
        source: {
            type: 'pods',
            selector: { metric: 'http_requests_total' },
        },
    },
    {
        name: 'active_users',
        type: ScalingMetricType.BUSINESS,
        description: '活跃用户数',
        targetType: 'AverageValue',
        targetValue: 1000,
        source: {
            type: 'external',
        },
    },
    {
        name: 'queue_length',
        type: ScalingMetricType.BUSINESS,
        description: '任务队列长度',
        targetType: 'AverageValue',
        targetValue: 100,
        source: {
            type: 'external',
        },
    },
];
exports.PREDEFINED_SCALING_RULES = [
    {
        id: 'backend-autoscaling',
        name: '后端服务自动扩缩容',
        targetDeployment: {
            name: 'lumina-backend',
            namespace: 'default',
            apiVersion: 'apps/v1',
            kind: 'Deployment',
        },
        minReplicas: 2,
        maxReplicas: 10,
        metrics: [
            {
                name: 'cpu_utilization',
                type: ScalingMetricType.RESOURCE,
                description: 'CPU利用率',
                targetType: 'Utilization',
                targetValue: 70,
                source: {
                    type: 'resource',
                    resourceName: 'cpu',
                },
            },
            {
                name: 'http_requests_per_second',
                type: ScalingMetricType.POD,
                description: '每秒HTTP请求数',
                targetType: 'AverageValue',
                targetValue: 100,
                source: {
                    type: 'pods',
                    selector: { metric: 'http_requests_total' },
                },
            },
        ],
        behavior: {
            scaleUp: {
                policies: [
                    { type: 'Pods', value: 2, periodSeconds: 60 },
                    { type: 'Percent', value: 100, periodSeconds: 60 },
                ],
                stabilizationWindowSeconds: 0,
                selectPolicy: 'Max',
            },
            scaleDown: {
                policies: [
                    { type: 'Pods', value: 1, periodSeconds: 300 },
                    { type: 'Percent', value: 50, periodSeconds: 300 },
                ],
                stabilizationWindowSeconds: 300,
                selectPolicy: 'Max',
            },
        },
        enabled: true,
    },
    {
        id: 'dashboard-autoscaling',
        name: '前端仪表板自动扩缩容',
        targetDeployment: {
            name: 'lumina-dashboard',
            namespace: 'default',
            apiVersion: 'apps/v1',
            kind: 'Deployment',
        },
        minReplicas: 1,
        maxReplicas: 5,
        metrics: [
            {
                name: 'cpu_utilization',
                type: ScalingMetricType.RESOURCE,
                description: 'CPU利用率',
                targetType: 'Utilization',
                targetValue: 70,
                source: {
                    type: 'resource',
                    resourceName: 'cpu',
                },
            },
            {
                name: 'active_users',
                type: ScalingMetricType.BUSINESS,
                description: '活跃用户数',
                targetType: 'AverageValue',
                targetValue: 500,
                source: {
                    type: 'external',
                },
            },
        ],
        enabled: true,
    },
];
//# sourceMappingURL=autoscaling.interface.js.map